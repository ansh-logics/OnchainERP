"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { 
  initiateMockRazorpayPayment, 
  mockVerifyPayment, 
  PaymentData, 
  RazorpayResponse 
} from '@/lib/razorpay';
import { mockStudent } from '@/lib/mock-data';
import { toast } from 'sonner';

interface RazorpayButtonProps {
  amount: number;
  currency?: string;
  description: string;
  feeType: string;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  children?: React.ReactNode;
}

export const RazorpayButton: React.FC<RazorpayButtonProps> = ({
  amount,
  currency = 'INR',
  description,
  feeType,
  onSuccess,
  onError,
  disabled = false,
  className = '',
  size = 'default',
  variant = 'default',
  children,
}) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);

    const paymentData: PaymentData = {
      amount,
      currency,
      description,
      studentName: mockStudent.name,
      studentEmail: mockStudent.email,
      studentPhone: mockStudent.phoneNumber,
      feeType,
    };

    try {
      await initiateMockRazorpayPayment(
        paymentData,
        async (response: RazorpayResponse) => {
          try {
            const verificationResult = await mockVerifyPayment(response);
            
            if (verificationResult.success) {
              toast.success('Payment completed successfully!');
              onSuccess?.(verificationResult);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            toast.error('Payment verification failed');
            onError?.(verifyError);
          } finally {
            setIsProcessing(false);
          }
        },
        (error: any) => {
          console.error('Payment failed:', error);
          setIsProcessing(false);
          toast.error('Payment failed. Please try again.');
          onError?.(error);
        },
        () => {
          setIsProcessing(false);
          toast.info('Payment cancelled');
        }
      );
    } catch (error) {
      console.error('Payment initiation error:', error);
      setIsProcessing(false);
      toast.error('Failed to initiate payment');
      onError?.(error);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={disabled || isProcessing}
      className={className}
      size={size}
      variant={variant}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : children ? (
        children
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Pay {formatAmount(amount)}
        </>
      )}
    </Button>
  );
};
