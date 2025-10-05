"use client";

import { useState, useCallback } from 'react';
import { 
  initiateRazorpayPayment, 
  verifyPayment, 
  PaymentData, 
  RazorpayResponse 
} from '@/lib/razorpay';
import { toast } from 'sonner';

interface UseRazorpayOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

export const useRazorpay = (options: UseRazorpayOptions = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = useCallback(async (paymentData: PaymentData) => {
    try {
      setIsProcessing(true);
      setError(null);

      await initiateRazorpayPayment(
        paymentData,
        async (response: RazorpayResponse) => {
          try {
            // Verify payment with backend
            const verificationResult = await verifyPayment(response);
            
            toast.success('Payment completed successfully!');
            options.onSuccess?.(verificationResult);
          } catch (verifyError: any) {
            console.error('Payment verification failed:', verifyError);
            const errorMessage = verifyError.message || 'Payment verification failed';
            setError(errorMessage);
            toast.error(errorMessage);
            options.onError?.(verifyError);
          } finally {
            setIsProcessing(false);
          }
        },
        (error: any) => {
          console.error('Payment failed:', error);
          const errorMessage = error.description || error.message || 'Payment failed. Please try again.';
          setError(errorMessage);
          setIsProcessing(false);
          toast.error(errorMessage);
          options.onError?.(error);
        },
        () => {
          setIsProcessing(false);
          toast.info('Payment cancelled');
          options.onDismiss?.();
        }
      );
    } catch (error: any) {
      console.error('Payment initiation failed:', error);
      const errorMessage = error.message || 'Failed to initiate payment';
      setError(errorMessage);
      setIsProcessing(false);
      toast.error(errorMessage);
      options.onError?.(error);
    }
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processPayment,
    isProcessing,
    error,
    clearError,
  };
};
