import Razorpay from 'razorpay';
import dotenv from 'dotenv';

// Load environment variables just in case this module is evaluated before server startup completes
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  console.warn(
    '⚠️ WARNING: Razorpay API credentials (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET) are missing or undefined in your .env environment variables.'
  );
}

// Instantiate and export the Razorpay client singleton
export const razorpay = new Razorpay({
  key_id: keyId || 'rzp_test_placeholder_key_id',
  key_secret: keySecret || 'placeholder_key_secret',
});

// Helper getter to retrieve the current public Key ID safely (e.g. to send to Flutter client)
export const getRazorpayKeyId = (): string => {
  return keyId || 'rzp_test_placeholder_key_id';
};
