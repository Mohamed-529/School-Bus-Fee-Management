import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { paymentService } from '../services/payment.service';

export class PaymentController {
  /**
   * POST /api/payments/create-order
   * Create Razorpay payment order
   */
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const { studentId, amount, term } = req.body;
      const performedBy = req.user?.name || 'Student Portal';

      if (!studentId) {
        res.status(400).json({
          success: false,
          message: 'Student ID is required.',
          errors: ['Missing required field: studentId']
        });
        return;
      }

      if (amount === undefined || amount === null) {
        res.status(400).json({
          success: false,
          message: 'Payment amount is required.',
          errors: ['Missing required field: amount']
        });
        return;
      }

      const orderData = await paymentService.createOrder({
        studentId,
        amount: Number(amount),
        term: term || 'both',
        performedBy
      });

      res.status(201).json({
        success: true,
        message: 'Razorpay order created successfully.',
        data: orderData
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Failed to create payment order.',
        errors: [err.toString()]
      });
    }
  }

  /**
   * POST /api/payments/verify
   * Verify Razorpay payment signature
   */
  async verifySignature(req: AuthRequest, res: Response) {
    try {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const performedBy = req.user?.name || 'Student Checkout';

      if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        res.status(400).json({
          success: false,
          message: 'Verification parameters (razorpayOrderId, razorpayPaymentId, razorpaySignature) are required.',
          errors: ['Missing required verification signatures']
        });
        return;
      }

      const result = await paymentService.verifySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        performedBy
      });

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          receiptNumber: result.receiptNumber
        }
      });
    } catch (err: any) {
      res.status(400).json({
        success: false,
        message: err.message || 'Signature verification failed.',
        errors: [err.toString()]
      });
    }
  }

  /**
   * GET /api/payments/history/:studentId
   * Retrieve paginated payment history
   */
  async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const { studentId } = req.params;
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.max(1, Number(req.query.limit) || 10);
      const status = req.query.status as string;
      const term = req.query.term as string;

      if (!studentId) {
        res.status(400).json({
          success: false,
          message: 'Student ID param is required.',
          errors: ['Missing required path parameter: studentId']
        });
        return;
      }

      const history = await paymentService.getPaymentHistory({
        studentId,
        page,
        limit,
        status,
        term
      });

      res.status(200).json({
        success: true,
        message: 'Payment history fetched successfully.',
        data: history
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: err.message || 'Failed to fetch payment history.',
        errors: [err.toString()]
      });
    }
  }
}

export const paymentController = new PaymentController();
