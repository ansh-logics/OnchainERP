"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2, Shield } from 'lucide-react';
import { useRazorpay } from '@/lib/hooks/useRazorpay';
import { PaymentData } from '@/lib/razorpay';

interface EnhancedRazorpayButtonProps {
  amount: number;
  currency?: string;
  description: string;
  feeType: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  children?: React.ReactNode;
  showSecurityInfo?: boolean;
}

export const EnhancedRazorpayButton: React.FC<EnhancedRazorpayButtonProps> = ({
  amount,
  currency = 'INR',
  description,
  feeType,
  studentName,
  studentEmail,
  studentPhone,
  onSuccess,
  onError,
  onDismiss,
  disabled = false,
  className = '',
  size = 'default',
  variant = 'default',
  children,
  showSecurityInfo = false,
}) => {
  const { processPayment, isProcessing, error } = useRazorpay({
    onSuccess,
    onError,
    onDismiss,
  });

  const handlePayment = async () => {
    const paymentData: PaymentData = {
      amount,
      currency,
      description,
      studentName,
      studentEmail,
      studentPhone,
      feeType,
    };

    await processPayment(paymentData);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  return (
    <div className="space-y-2">
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
      
      {showSecurityInfo && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <Shield className="h-3 w-3" />
          <span>Secured by Razorpay SSL</span>
        </div>
      )}
      
      {error && (
        <div className="text-xs text-red-600 mt-1">
          {error}
        </div>
      )}
    </div>
  );
};
