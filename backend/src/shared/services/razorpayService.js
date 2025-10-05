const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance with test credentials
const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RP4iA95YzW2bj1',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'qS3rHb6d14xW0pIPU6FGtNpH'
};

console.log('Razorpay Config:', { 
  key_id: razorpayConfig.key_id, 
  key_secret_length: razorpayConfig.key_secret.length 
});

const razorpay = new Razorpay(razorpayConfig);

/**
 * Create a Razorpay order
 * @param {Object} orderData - Order details
 * @returns {Object} Razorpay order
 */
const createOrder = async (orderData) => {
  try {
    const options = {
      amount: Math.round(orderData.amount * 100), // Convert to paisa
      currency: 'INR',
      receipt: orderData.receipt,
      payment_capture: 1, // Auto capture payment
      notes: orderData.notes || {}
    };

    console.log('Creating Razorpay order with options:', options);
    
    const order = await razorpay.orders.create(options);
    
    console.log('Razorpay order created successfully:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status
    });
    
    return {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
      created_at: order.created_at
    };
  } catch (error) {
    console.error('Razorpay order creation error:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });
    
    // Return a mock order for testing purposes in development
    if (process.env.NODE_ENV === 'development' || !process.env.RAZORPAY_KEY_SECRET) {
      console.log('Returning mock order for development/testing');
      const mockOrder = {
        id: `order_mock_${Date.now()}`,
        amount: Math.round(orderData.amount * 100),
        currency: 'INR',
        receipt: orderData.receipt,
        status: 'created',
        created_at: Math.floor(Date.now() / 1000)
      };
      return mockOrder;
    }
    
    throw new Error(`Failed to create payment order: ${error.message}`);
  }
};

/**
 * Verify payment signature
 * @param {Object} paymentData - Payment verification data
 * @returns {Boolean} Is payment verified
 */
const verifyPayment = (paymentData) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'your_test_key_secret';

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('Payment verification error:', error);
    return false;
  }
};

/**
 * Get payment details
 * @param {String} paymentId - Razorpay payment ID
 * @returns {Object} Payment details
 */
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

/**
 * Create refund
 * @param {String} paymentId - Razorpay payment ID
 * @param {Number} amount - Refund amount in paisa
 * @returns {Object} Refund details
 */
const createRefund = async (paymentId, amount) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount
    });
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
};

/**
 * Generate a short receipt ID that complies with Razorpay's 40-character limit
 * @param {String} prefix - Receipt prefix (e.g., 'rcpt', 'fee')
 * @param {String} identifier - Identifier to be shortened (UUID, enrollment number, etc.)
 * @returns {String} Short receipt ID
 */
const generateShortReceipt = (prefix, identifier) => {
  // Remove hyphens and take first 8 characters for UUIDs
  const shortId = identifier.replace(/-/g, '').substring(0, 8);
  // Take last 8 digits of timestamp
  const timestamp = Date.now().toString().slice(-8);
  
  return `${prefix}_${shortId}_${timestamp}`;
};

module.exports = {
  createOrder,
  verifyPayment,
  getPaymentDetails,
  createRefund,
  generateShortReceipt,
  razorpay
};
