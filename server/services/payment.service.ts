import crypto from 'crypto';
import { razorpay, getRazorpayKeyId } from '../config/razorpay';
import { studentRepository } from '../repositories/student.repository';
import { paymentRepository } from '../repositories/payment.repository';
import { db } from '../db/database';

export class PaymentService {
  /**
   * Create Razorpay Order and store a pending payment record
   */
  async createOrder(params: {
    studentId: string;
    amount: number;
    term: 'term1' | 'term2' | 'both';
    performedBy: string;
  }) {
    const { studentId, amount, term, performedBy } = params;

    // 1. Validation - Amount must be positive
    if (!amount || amount <= 0) {
      throw new Error('Payment amount must be greater than 0.');
    }

    // 2. Validation - Student must exist
    const student = await studentRepository.findByIdOrStudentId(studentId);
    if (!student) {
      console.warn(`[PAYMENT CREATION WARNING] Student profile not found for ID: ${studentId}`);
      throw new Error('Student profile not found.');
    }

    // 3. Validation - Prevent duplicate or overpayment
    const totalFees = (student.term1Fee || 0) + (student.term2Fee || 0);
    const completedPayments = await paymentRepository.findCompletedPaymentsByStudentId(student.studentId);
    const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const actualPendingAmount = Math.max(0, totalFees - totalPaid);

    // [TASK 9 LOGGING] Output exhaustive diagnostics
    console.log(`\n=================== [PAYMENT TRANSACTION DIAGNOSTIC] ===================`);
    console.log(`[STUDENT DETAIL]`);
    console.log(`  - ID: ${student.id}`);
    console.log(`  - Student ID: ${student.studentId}`);
    console.log(`  - Name: ${student.name}`);
    console.log(`  - Term 1 Fee: ${student.term1Fee}`);
    console.log(`  - Term 2 Fee: ${student.term2Fee}`);
    console.log(`  - Profile Paid Amount: ${student.paidAmount}`);
    console.log(`  - Profile Pending Amount: ${student.pendingAmount}`);
    console.log(`  - Profile Status: ${student.status}`);
    console.log(`[COMPLETED PAYMENTS IN DB]`);
    if (completedPayments.length === 0) {
      console.log(`  - None`);
    } else {
      completedPayments.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ID: ${p.id} | Status: ${p.status} | Amount: ${p.amount} | Term: ${p.term} | Receipt: ${p.receiptNumber} | RazorpayOrderID: ${p.razorpayOrderId || 'N/A'}`);
      });
    }
    console.log(`[CALCULATED DUE LEDGER]`);
    console.log(`  - Total Fees: ${totalFees}`);
    console.log(`  - Total Paid (Sum of Completed): ${totalPaid}`);
    console.log(`  - Actual Pending Amount: ${actualPendingAmount}`);
    console.log(`  - Requested Checkout Amount: ${amount}`);
    
    const validationPassed = (actualPendingAmount > 0) && (amount <= actualPendingAmount);
    console.log(`[VALIDATION RESULT]`);
    console.log(`  - Is Outstanding Dues > 0? ${actualPendingAmount > 0}`);
    console.log(`  - Is Requested Amount <= Outstanding Dues? ${amount <= actualPendingAmount}`);
    console.log(`  - Overall Validation Passed? ${validationPassed}`);

    if (actualPendingAmount <= 0) {
      console.error(`[PAYMENT ERROR] Rejected: Dues are already fully settled (Pending: ${actualPendingAmount})`);
      console.log(`========================================================================\n`);
      throw new Error('Fees are already fully paid. No outstanding dues remain.');
    }

    if (amount > actualPendingAmount) {
      console.error(`[PAYMENT ERROR] Rejected: Overpayment prevented. Request ${amount} exceeds remaining ${actualPendingAmount}`);
      console.log(`========================================================================\n`);
      throw new Error(`Overpayment prevented. The requested amount (${amount}) exceeds the remaining pending dues (${actualPendingAmount}).`);
    }

    // 4. Create receipt ID & Razorpay Order
    const receipt = 'RCP_RZP_' + Date.now().toString().slice(-6) + '_' + Math.random().toString(36).substr(2, 3).toUpperCase();
    
    let razorpayOrder;
    try {
      console.log(`[RAZORPAY SDK] Calling razorpay.orders.create() for receipt: ${receipt} of amount: ${amount}`);
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(amount * 100), // Razorpay accepts amounts in paise
        currency: 'INR',
        receipt,
        notes: {
          studentId: student.studentId,
          studentName: student.name,
          term,
        },
      });
      console.log(`[RAZORPAY SDK] Successfully generated Order ID: ${razorpayOrder.id}`);
      console.log(`========================================================================\n`);
    } catch (err: any) {
      console.error(`[RAZORPAY SDK ERROR] Order creation failed: ${err.message}`);
      console.log(`========================================================================\n`);
      await db.logAction(
        'PAYMENT_CREATION_FAILED',
        'Finance',
        `Razorpay order creation failed for student ${student.name}: ${err.message}`,
        performedBy,
        'student'
      );
      throw new Error(`Razorpay gateway error: ${err.message}`);
    }

    // 5. Store pending payment in MongoDB
    const pendingPaymentId = 'pay_rzp_' + Date.now();
    await paymentRepository.createPendingPayment({
      id: pendingPaymentId,
      receiptNumber: receipt,
      studentId: student.studentId,
      studentName: student.name,
      classSection: `${student.class} - ${student.section}`,
      amount,
      term,
      paymentDate: new Date().toISOString(),
      method: 'Online Card',
      status: 'pending',
      remarks: `Pending Razorpay checkout for ${term.toUpperCase()}`,
      academicYear: student.academicYear || '2026 - 2027',
      razorpayOrderId: razorpayOrder.id,
    });

    // 6. Log Audit Event
    await db.logAction(
      'PAYMENT_CREATED',
      'Finance',
      `Razorpay payment order ${razorpayOrder.id} of amount ${amount} created for student ${student.name}`,
      performedBy,
      'student'
    );

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      keyId: getRazorpayKeyId(),
    };
  }

  /**
   * Verify Razorpay Payment Signature and finalize transaction state
   */
  async verifySignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    performedBy: string;
  }) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, performedBy } = params;

    // 1. Validation - Check if order exists in DB
    const payment = await paymentRepository.findByOrderId(razorpayOrderId);
    if (!payment) {
      await db.logAction(
        'PAYMENT_VERIFICATION_FAILED',
        'Finance',
        `Verification failed: No pending transaction found for order ID ${razorpayOrderId}`,
        performedBy,
        'student'
      );
      throw new Error(`No pending transaction found for Razorpay Order ID: ${razorpayOrderId}`);
    }

    // 2. Prevent redundant processing
    if (payment.status === 'completed') {
      return { success: true, message: 'Payment has already been successfully verified and completed.' };
    }

    // 3. Signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      throw new Error('Razorpay secret key configuration is missing on the server.');
    }

    const payload = razorpayOrderId + '|' + razorpayPaymentId;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      // Signature is invalid! Mark as failed
      payment.status = 'failed';
      payment.remarks = 'Signature verification failed. Potential tampering detected.';
      await paymentRepository.save(payment);

      await db.logAction(
        'PAYMENT_FAILED',
        'Finance',
        `Tampered/Failed Payment for order ${razorpayOrderId}. Signatures did not match.`,
        performedBy,
        'student'
      );

      throw new Error('Razorpay payment signature mismatch. Transaction marked as failed.');
    }

    // 4. Update Payment to Completed
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.remarks = `Paid securely via Razorpay (Order: ${razorpayOrderId}, Payment: ${razorpayPaymentId})`;
    await paymentRepository.save(payment);

    // 5. Update Student dues
    const student = await studentRepository.findByIdOrStudentId(payment.studentId);
    if (student) {
      const allCompleted = await paymentRepository.findCompletedPaymentsByStudentId(student.studentId);
      const totalPaid = allCompleted.reduce((sum, p) => sum + p.amount, 0);
      const totalFees = (student.term1Fee || 0) + (student.term2Fee || 0);

      student.paidAmount = totalPaid;
      student.pendingAmount = Math.max(0, totalFees - totalPaid);

      if (student.paidAmount >= totalFees && totalFees > 0) {
        student.status = 'paid';
      } else if (student.paidAmount > 0) {
        student.status = 'partial';
      } else {
        student.status = 'pending';
      }

      await studentRepository.save(student);
    }

    // 6. Audit Logging
    await db.logAction(
      'PAYMENT_SUCCESS',
      'Finance',
      `Payment successfully recorded for student ${payment.studentName}. Amount: ${payment.amount} (Receipt: ${payment.receiptNumber})`,
      performedBy,
      'student'
    );

    await db.logAction(
      'PAYMENT_VERIFIED',
      'Finance',
      `Verified Razorpay payment ${razorpayPaymentId} against order ${razorpayOrderId}`,
      performedBy,
      'student'
    );

    return {
      success: true,
      message: 'Payment verified and credited successfully.',
      receiptNumber: payment.receiptNumber,
    };
  }

  /**
   * Retrieve paginated, sorted payment history for a student
   */
  async getPaymentHistory(params: {
    studentId: string;
    page: number;
    limit: number;
    status?: string;
    term?: string;
  }) {
    return await paymentRepository.findHistoryByStudentId(params);
  }
}

export const paymentService = new PaymentService();
