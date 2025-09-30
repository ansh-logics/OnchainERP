"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CreditCard,
  Smartphone,
  Building2,
  Wallet,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Copy,
  QrCode,
  Download
} from "lucide-react";
import { downloadReceipt } from "./receipt";

interface FeeRecord {
  id: string;
  type: string;
  amount: number;
  dueDate: string;
  semester: string;
  status: 'paid' | 'pending' | 'overdue';
  paidDate?: string;
  transactionId?: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  feeRecord: FeeRecord;
  onPaymentSuccess: (feeId: string, transactionId: string) => void;
}

export function PaymentModal({ isOpen, onClose, feeRecord, onPaymentSuccess }: PaymentModalProps) {
  const [paymentStep, setPaymentStep] = useState<'method' | 'processing' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [formData, setFormData] = useState({
    // Card details
    cardNumber: '',
    cardName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    
    // UPI details
    upiId: '',
    
    // Net Banking
    bank: '',
    
    // Wallet
    walletProvider: '',
    
    // Common
    agreeTerms: false
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const processPayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');
    
    // Generate transaction ID
    const txnId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    setTransactionId(txnId);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setPaymentStep('success');
    setIsProcessing(false);
    
    // Simulate successful payment
    setTimeout(() => {
      onPaymentSuccess(feeRecord.id, txnId);
    }, 2000);
  };

  const isFormValid = () => {
    if (!formData.agreeTerms) return false;
    
    switch (selectedMethod) {
      case 'card':
        return formData.cardNumber && formData.cardName && formData.expiryMonth && 
               formData.expiryYear && formData.cvv;
      case 'upi':
        return formData.upiId;
      case 'netbanking':
        return formData.bank;
      case 'wallet':
        return formData.walletProvider;
      default:
        return false;
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const renderPaymentMethod = () => {
    switch (selectedMethod) {
      case 'card':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                maxLength={19}
              />
            </div>
            <div>
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={formData.cardName}
                onChange={(e) => handleInputChange('cardName', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label htmlFor="expiryMonth">Month</Label>
                <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="MM" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expiryYear">Year</Label>
                <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={2024 + i} value={String(2024 + i)}>
                        {2024 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
          </div>
        );

      case 'upi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="upiId">UPI ID</Label>
              <Input
                id="upiId"
                placeholder="username@paytm"
                value={formData.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
              />
            </div>
            <Card className="p-4 bg-blue-50">
              <div className="flex items-center gap-3">
                <QrCode className="h-12 w-12 text-blue-600" />
                <div>
                  <h4 className="font-semibold">Scan QR Code</h4>
                  <p className="text-sm text-gray-600">Or use any UPI app to pay</p>
                </div>
              </div>
            </Card>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy UPI ID
              </Button>
              <span className="text-sm text-gray-600">payment@college.edu.in</span>
            </div>
          </div>
        );

      case 'netbanking':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bank">Select Bank</Label>
              <Select value={formData.bank} onValueChange={(value) => handleInputChange('bank', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sbi">State Bank of India</SelectItem>
                  <SelectItem value="hdfc">HDFC Bank</SelectItem>
                  <SelectItem value="icici">ICICI Bank</SelectItem>
                  <SelectItem value="axis">Axis Bank</SelectItem>
                  <SelectItem value="pnb">Punjab National Bank</SelectItem>
                  <SelectItem value="bob">Bank of Baroda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm text-yellow-800">
                  You will be redirected to your bank&apos;s secure login page
                </span>
              </div>
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Wallet Provider</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { id: 'paytm', name: 'Paytm', icon: '💰' },
                  { id: 'phonepe', name: 'PhonePe', icon: '📱' },
                  { id: 'gpay', name: 'Google Pay', icon: '🎯' },
                  { id: 'amazonpay', name: 'Amazon Pay', icon: '🛒' }
                ].map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant={formData.walletProvider === wallet.id ? "default" : "outline"}
                    className="h-12"
                    onClick={() => handleInputChange('walletProvider', wallet.id)}
                  >
                    <span className="mr-2">{wallet.icon}</span>
                    {wallet.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderProcessingStep = () => (
    <div className="text-center py-8">
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
      <h3 className="text-lg font-semibold mb-2">Processing Payment</h3>
      <p className="text-gray-600">Please wait while we process your payment securely...</p>
    </div>
  );

  const handleDownloadReceipt = () => {
    const receiptData = {
      transactionId,
      feeType: feeRecord.type,
      amount: feeRecord.amount,
      paymentDate: new Date().toISOString(),
      semester: feeRecord.semester,
      studentName: "John Doe", // This should come from user context
      studentId: "ST2024001", // This should come from user context
      rollNumber: "21CS001", // This should come from user context
      department: "Computer Science", // This should come from user context
      paymentMethod: selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1),
      dueDate: feeRecord.dueDate,
      academicYear: "2024-25"
    };
    
    downloadReceipt(receiptData);
  };

  const renderSuccessStep = () => (
    <div className="text-center py-8">
      <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-600" />
      <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
      <p className="text-gray-600 mb-4">
        Your payment of ₹{feeRecord.amount.toLocaleString()} has been processed successfully.
      </p>
      <div className="bg-green-50 p-3 rounded-lg mb-6">
        <p className="text-sm text-green-800">
          Transaction ID: {transactionId}
        </p>
      </div>
      
      {/* Action Buttons */}
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
          onClick={() => {
            onClose();
            setPaymentStep('method');
          }}
          className="w-full"
        >
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pay Fee
          </DialogTitle>
          <DialogDescription>
            {paymentStep === 'method' && `Complete payment for ${feeRecord.type} fee`}
            {paymentStep === 'processing' && 'Processing your payment'}
            {paymentStep === 'success' && 'Payment completed successfully'}
          </DialogDescription>
        </DialogHeader>

        {paymentStep === 'method' && (
          <>
            {/* Payment Summary */}
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{feeRecord.type.charAt(0).toUpperCase() + feeRecord.type.slice(1)} Fee</h4>
                    <p className="text-sm text-gray-600">{feeRecord.semester}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">₹{feeRecord.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(feeRecord.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Tabs value={selectedMethod} onValueChange={(value: string) => setSelectedMethod(value)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="card" className="text-xs">
                  <CreditCard className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="upi" className="text-xs">
                  <Smartphone className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="netbanking" className="text-xs">
                  <Building2 className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="wallet" className="text-xs">
                  <Wallet className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="card" className="mt-4">
                {renderPaymentMethod()}
              </TabsContent>
              <TabsContent value="upi" className="mt-4">
                {renderPaymentMethod()}
              </TabsContent>
              <TabsContent value="netbanking" className="mt-4">
                {renderPaymentMethod()}
              </TabsContent>
              <TabsContent value="wallet" className="mt-4">
                {renderPaymentMethod()}
              </TabsContent>
            </Tabs>

            {/* Terms and Conditions */}
            <div className="flex items-center space-x-2 mt-4">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked: boolean) => handleInputChange('agreeTerms', !!checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the <span className="text-blue-600 underline cursor-pointer">terms and conditions</span>
              </Label>
            </div>

            {/* Security Notice */}
            <div className="bg-gray-50 p-3 rounded-lg mt-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  Your payment is secured with 256-bit SSL encryption
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={processPayment}
                disabled={!isFormValid() || isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay ₹{feeRecord.amount.toLocaleString()}
                  </>
                )}
              </Button>
            </div>
          </>
        )}

        {paymentStep === 'processing' && renderProcessingStep()}
        {paymentStep === 'success' && renderSuccessStep()}
      </DialogContent>
    </Dialog>
  );
}
