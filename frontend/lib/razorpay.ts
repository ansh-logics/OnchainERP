// Razorpay integration utility
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  description: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  feeType: string;
}

// Import auth helpers
import { getAuthToken, isAuthenticated } from './auth';

export const RAZORPAY_KEY = 'rzp_test_RP4iA95YzW2bj1';

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Create Razorpay order
export const createRazorpayOrder = async (paymentData: PaymentData) => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Please login to continue with payment');
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch('/api/payment/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        amount: paymentData.amount, // Amount in rupees, backend will convert to paise
        currency: paymentData.currency,
        description: paymentData.description,
        feeType: paymentData.feeType,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create payment order');
    }

    if (!data.success) {
      throw new Error(data.message || 'Payment order creation failed');
    }

    return data.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (
  paymentData: PaymentData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void,
  onDismiss: () => void
) => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay script. Please check your internet connection.');
    }

    // Create order
    const order = await createRazorpayOrder(paymentData);

    // Razorpay options
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'OnchainERP College',
      description: paymentData.description,
      order_id: order.orderId || order.id,
      handler: (response: RazorpayResponse) => {
        onSuccess(response);
      },
      prefill: {
        name: paymentData.studentName,
        email: paymentData.studentEmail,
        contact: paymentData.studentPhone,
      },
      theme: {
        color: '#2563eb', // Blue theme
      },
      modal: {
        ondismiss: onDismiss,
      },
    };

    // Create and open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      console.error('Razorpay payment failed:', response);
      onError(response.error || { description: 'Payment failed. Please try again.' });
    });
    razorpay.open();

  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    onError(error);
  }
};

// Verify payment on server
export const verifyPayment = async (paymentResponse: RazorpayResponse) => {
  try {
    if (!isAuthenticated()) {
      throw new Error('Please login to continue with payment verification');
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch('/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(paymentResponse),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Payment verification failed');
    }

    if (!data.success) {
      throw new Error(data.message || 'Payment verification failed');
    }

    return data.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Mock payment verification for demo (since we're using mock data)
export const mockVerifyPayment = async (paymentResponse: RazorpayResponse): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    paymentId: paymentResponse.razorpay_payment_id,
    orderId: paymentResponse.razorpay_order_id,
    signature: paymentResponse.razorpay_signature,
    status: 'captured',
    message: 'Payment verified successfully',
  };
};

// Mock order creation for demo
export const mockCreateRazorpayOrder = async (paymentData: PaymentData): Promise<any> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    id: `order_${Date.now()}`,
    amount: paymentData.amount * 100,
    currency: paymentData.currency,
    status: 'created',
  };
};

// Demo version of payment initialization (uses mock APIs)
export const initiateMockRazorpayPayment = async (
  paymentData: PaymentData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: any) => void,
  onDismiss: () => void
) => {
  try {
    // Load Razorpay script
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    // Create mock order
    const order = await mockCreateRazorpayOrder(paymentData);

    // Razorpay options
    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'Yukti University',
      description: paymentData.description,
      order_id: order.id,
      handler: (response: RazorpayResponse) => {
        onSuccess(response);
      },
      prefill: {
        name: paymentData.studentName,
        email: paymentData.studentEmail,
        contact: paymentData.studentPhone,
      },
      theme: {
        color: '#2563eb', // Blue theme
      },
      modal: {
        ondismiss: onDismiss,
      },
    };

    // Create and open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      onError(response.error);
    });
    razorpay.open();

  } catch (error) {
    console.error('Error initiating Razorpay payment:', error);
    onError(error);
  }
};
