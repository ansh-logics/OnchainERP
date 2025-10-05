"use client";

import { useState } from "react";
import Script from "next/script";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Info
} from "lucide-react";
import { api } from "@/lib/api";
import { getAuthToken, isAuthenticated } from "@/lib/auth";
import { downloadReceipt } from "./receipt";

interface FeeSummary {
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  feeStatus: 'Paid' | 'Partial' | 'Unpaid';
}

interface RazorpayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeSummary: FeeSummary;
  studentInfo: {
    name: string;
    email: string;
    enrollmentNumber: string;
    department?: string;
  };
  onPaymentSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayPaymentModal({ 
  isOpen, 
  onClose, 
  feeSummary, 
  studentInfo, 
  onPaymentSuccess 
}: RazorpayPaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<'amount' | 'processing' | 'success'>('amount');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleAmountChange = (value: string) => {
    // Only allow numeric values
    const numericValue = value.replace(/[^0-9.]/g, '');
    setPaymentAmount(numericValue);
    setError('');
  };

  const validateAmount = (): boolean => {
    const amount = parseFloat(paymentAmount);
    
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (amount > feeSummary.remainingAmount) {
      setError('Amount exceeds remaining balance');
      return false;
    }
    
    if (amount < 1) {
      setError('Minimum payment amount is ₹1');
      return false;
    }
    
    return true;
  };

  const createRazorpayOrder = async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to continue with payment');
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      // Use the new centralized payment endpoint
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          currency: 'INR',
          description: `Fee payment for ${studentInfo.enrollmentNumber}`,
          feeType: 'tuition'
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create payment order');
      }

      if (!data.success) {
        throw new Error(data.message || 'Payment order creation failed');
      }

      const orderData = data.data;
      
      // Ensure we have the required fields and format them correctly
      return {
        orderId: orderData.orderId || orderData.id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        keyId: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RP4iA95YzW2bj1',
        studentName: studentInfo.name,
        studentEmail: studentInfo.email,
        description: `Fee payment for ${studentInfo.enrollmentNumber}`,
        feeSummary: feeSummary
      };
    } catch (error: any) {
      console.error('Error creating payment order:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
  };

  const verifyPayment = async (paymentData: any) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please login to continue');
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
        body: JSON.stringify({
          ...paymentData,
          amount: parseFloat(paymentAmount)
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Payment verification failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      return data.data;
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Payment verification failed');
    }
  };

  const handlePayment = async () => {
    if (!validateAmount()) return;
    
    if (!razorpayLoaded) {
      setError('Payment gateway is loading. Please wait...');
      return;
    }

    // Check authentication before proceeding
    if (!isAuthenticated()) {
      setError('You must be logged in to make a payment. Please login and try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');
    
    try {
      // Create Razorpay order
      const orderData = await createRazorpayOrder();

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'OnchainERP College',
        description: orderData.description,
        order_id: orderData.orderId,
        prefill: {
          name: studentInfo.name,
          email: studentInfo.email,
          contact: '' // Add phone if available
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setPaymentStep('amount');
            setError('Payment cancelled');
          }
        },
        handler: async (response: any) => {
          try {
            // Verify payment with backend
            const verificationResult = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // Use receipt data from backend if available, otherwise create it
            const receiptData = verificationResult.receiptData || {
              transactionId: verificationResult.razorpayPaymentId || 'N/A',
              feeType: 'tuition',
              amount: parseFloat(paymentAmount),
              paymentDate: new Date().toISOString(),
              semester: `Semester ${new Date().getMonth() < 6 ? 'I' : 'II'}`,
              studentName: studentInfo.name,
              studentId: verificationResult.transactionId || 'N/A',
              rollNumber: studentInfo.enrollmentNumber,
              department: studentInfo.department || 'N/A',
              paymentMethod: 'Razorpay',
              dueDate: new Date().toISOString(),
              academicYear: '2024-25'
            };

            setTransactionDetails({
              ...verificationResult,
              paymentAmount: parseFloat(paymentAmount),
              paymentDate: new Date().toISOString(),
              studentInfo,
              receiptData
            });

            setPaymentStep('success');
            onPaymentSuccess();
          } catch (error: any) {
            setError(error.message);
            setPaymentStep('amount');
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error: any) {
      setError(error.message);
      setPaymentStep('amount');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (transactionDetails) {
      // Use the receipt data from the backend if available
      const receiptData = transactionDetails.receiptData || {
        transactionId: transactionDetails.razorpayPaymentId || 'N/A',
        feeType: 'tuition',
        amount: transactionDetails.paymentAmount,
        paymentDate: transactionDetails.paymentDate,
        semester: `Semester ${new Date().getMonth() < 6 ? 'I' : 'II'}`,
        studentName: studentInfo.name,
        studentId: transactionDetails.transactionId || 'N/A',
        rollNumber: studentInfo.enrollmentNumber,
        department: studentInfo.department || 'N/A',
        paymentMethod: 'Razorpay',
        dueDate: new Date().toISOString(),
        academicYear: '2024-25'
      };
      
      downloadReceipt(receiptData);
    }
  };

  const resetModal = () => {
    setPaymentStep('amount');
    setPaymentAmount('');
    setError('');
    setTransactionDetails(null);
    onClose();
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
      {/* Fee Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 text-gray-800">Fee Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Fees</p>
              <p className="text-lg font-bold text-gray-800">₹{feeSummary.totalFees.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Paid Amount</p>
              <p className="text-lg font-bold text-green-600">₹{feeSummary.paidAmount.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-600">Outstanding Balance</p>
              <p className="text-2xl font-bold text-red-600">₹{feeSummary.remainingAmount.toLocaleString()}</p>
            </div>
          </div>
          <Badge className="mt-3" variant={
            feeSummary.feeStatus === 'Paid' ? 'default' :
            feeSummary.feeStatus === 'Partial' ? 'secondary' : 'destructive'
          }>
            {feeSummary.feeStatus}
          </Badge>
        </CardContent>
      </Card>

      {/* Payment Amount Input */}
      <div className="space-y-2">
        <Label htmlFor="amount" className="text-base font-semibold">Payment Amount</Label>
        <Input
          id="amount"
          type="text"
          placeholder="Enter amount"
          value={paymentAmount}
          onChange={(e) => handleAmountChange(e.target.value)}
          className="text-lg p-3"
        />
        <div className="flex justify-between items-center text-sm">
          <p className="text-gray-600">
            Maximum: ₹{feeSummary.remainingAmount.toLocaleString()}
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setPaymentAmount(feeSummary.remainingAmount.toString())}
            className="p-0 h-auto text-blue-600"
          >
            Pay Full Amount
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Security Notice */}
      <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="text-green-800 font-medium">Secure Payment</p>
          <p className="text-green-700">Your payment is secured by Razorpay with 256-bit SSL encryption</p>
        </div>
      </div>

      {/* Quick Amount Options */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-600">Quick Amount Selection</Label>
        <div className="grid grid-cols-3 gap-2">
          {[25, 50, 75].map(percentage => {
            const amount = Math.round((feeSummary.remainingAmount * percentage) / 100);
            return (
              <Button
                key={percentage}
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(amount.toString())}
                className="text-xs"
              >
                {percentage}%
                <br />
                ₹{amount.toLocaleString()}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
      <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
      <p className="text-gray-600">Please complete the payment in the popup window...</p>
      <p className="text-sm text-gray-500 mt-2">Do not close this window or refresh the page</p>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
      <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
      <p className="text-gray-600 mb-6">
        Your payment of ₹{transactionDetails?.paymentAmount?.toLocaleString()} has been processed successfully.
      </p>
      
      {transactionDetails && (
        <div className="bg-green-50 p-4 rounded-lg mb-6 text-left">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-green-800">{transactionDetails.razorpayPaymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-semibold">₹{transactionDetails.paymentAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Balance:</span>
              <span className="font-semibold">₹{transactionDetails.remainingAmount?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant="default">{transactionDetails.feeStatus}</Badge>
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <Button 
          onClick={handleDownloadReceipt}
          className="w-full"
          variant="outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Receipt
        </Button>
        <Button 
          onClick={resetModal}
          className="w-full"
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
      />
      
      <Dialog open={isOpen} onOpenChange={resetModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Fee Payment
            </DialogTitle>
            <DialogDescription>
              {paymentStep === 'amount' && 'Enter the amount you want to pay'}
              {paymentStep === 'processing' && 'Processing your payment'}
              {paymentStep === 'success' && 'Payment completed successfully'}
            </DialogDescription>
          </DialogHeader>

          {paymentStep === 'amount' && renderAmountStep()}
          {paymentStep === 'processing' && renderProcessingStep()}
          {paymentStep === 'success' && renderSuccessStep()}

          {paymentStep === 'amount' && (
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={isProcessing || !razorpayLoaded}
                className="flex-1"
              >
                {!razorpayLoaded ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹{paymentAmount ? parseFloat(paymentAmount).toLocaleString() : '0'}
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
