import { PaymentModel } from '../models/Payment';

export class PaymentRepository {
  /**
   * Create a pending payment record
   */
  async createPendingPayment(data: {
    id: string;
    receiptNumber: string;
    studentId: string;
    studentName: string;
    classSection: string;
    amount: number;
    term: string;
    paymentDate: string;
    method: string;
    status: string;
    remarks: string;
    academicYear: string;
    razorpayOrderId: string;
  }) {
    const payment = new PaymentModel(data);
    return await payment.save();
  }

  /**
   * Find a payment record by Razorpay Order ID
   */
  async findByOrderId(razorpayOrderId: string) {
    return await PaymentModel.findOne({ razorpayOrderId });
  }

  /**
   * Find all completed payments for a student
   */
  async findCompletedPaymentsByStudentId(studentId: string) {
    return await PaymentModel.find({ studentId, status: 'completed' });
  }

  /**
   * Find payment history with pagination, sorting, and filtering
   */
  async findHistoryByStudentId(params: {
    studentId: string;
    page: number;
    limit: number;
    status?: string;
    term?: string;
  }) {
    const { studentId, page, limit, status, term } = params;
    
    const query: any = { studentId };
    if (status) {
      query.status = status;
    }
    if (term) {
      query.term = term;
    }

    const skip = (page - 1) * limit;

    const total = await PaymentModel.countDocuments(query);
    const payments = await PaymentModel.find(query)
      .sort({ paymentDate: -1 }) // Default to newest first
      .skip(skip)
      .limit(limit);

    return {
      payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Save payment document
   */
  async save(paymentDoc: any) {
    return await paymentDoc.save();
  }
}

export const paymentRepository = new PaymentRepository();
