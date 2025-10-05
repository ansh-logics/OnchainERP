"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { EnhancedRazorpayButton } from '@/components/payment/enhanced-razorpay-button';
import { RazorpayButton } from '@/components/payment/razorpay-button';
import { RazorpayPaymentModal } from '@/components/payment/razorpay-payment-modal';
import { useRazorpay } from '@/lib/hooks/useRazorpay';
import { AuthDebugger } from '@/components/debug/auth-debugger';
import { ensureTestAuth, loginWithTestCredentials, clearTestAuth, getTestAuthStatus } from '@/lib/test-auth';
import { toast } from 'sonner';
import { CreditCard, TestTube, Shield, CheckCircle } from 'lucide-react';

export default function PaymentTestPage() {
  const [amount, setAmount] = useState('1000');
  const [showModal, setShowModal] = useState(false);
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState({
    name: 'John Doe',
    email: 'john.doe@student.edu',
    phone: '+919876543210',
    enrollmentNumber: 'STU2024001',
    department: 'Computer Science'
  });

  const { processPayment, isProcessing, error } = useRazorpay({
    onSuccess: (data) => {
      toast.success('Payment successful!');
      console.log('Payment Success:', data);
    },
    onError: (error) => {
      toast.error('Payment failed!');
      console.error('Payment Error:', error);
    },
  });

  // Update auth status
  const updateAuthStatus = () => {
    setAuthStatus(getTestAuthStatus());
  };

  useEffect(() => {
    updateAuthStatus();
  }, []);

  const handleCustomPayment = () => {
    processPayment({
      amount: parseFloat(amount),
      currency: 'INR',
      description: 'Test Payment',
      studentName: studentInfo.name,
      studentEmail: studentInfo.email,
      studentPhone: studentInfo.phone,
      feeType: 'tuition',
    });
  };

  const mockFeeSummary = {
    totalFees: 100000,
    paidAmount: 25000,
    remainingAmount: 75000,
    feeStatus: 'Partial' as const
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Razorpay Integration Test
          </h1>
          <p className="text-lg text-gray-600">
            Test all Razorpay payment components and functionality
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <Shield className="h-4 w-4" />
            <span>Test Environment - Safe to Use</span>
          </div>
        </div>

        {/* Authentication Status */}
        <Card className={`border-2 ${authStatus?.hasToken ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Status
            </CardTitle>
            <CardDescription>
              {authStatus?.hasToken ? 'Ready for payment testing' : 'Authentication required for payments'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Token: </span>
                <span className={authStatus?.hasToken ? 'text-green-600' : 'text-red-600'}>
                  {authStatus?.hasToken ? '✅ Present' : '❌ Missing'}
                </span>
              </div>
              <div>
                <span className="font-medium">User: </span>
                <span className={authStatus?.hasUser ? 'text-green-600' : 'text-red-600'}>
                  {authStatus?.user?.name || 'Not logged in'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  const result = await ensureTestAuth();
                  updateAuthStatus();
                  if (result && result.success) {
                    toast.success(result.existing ? 'Auth token refreshed!' : 'Successfully logged in!');
                  } else {
                    toast.error('Login failed: ' + (result?.error || 'Unknown error'));
                  }
                }}
                size="sm"
                variant={authStatus?.hasToken ? 'outline' : 'default'}
              >
                {authStatus?.hasToken ? 'Refresh Auth' : 'Login with Test User'}
              </Button>
              <Button 
                onClick={() => {
                  clearTestAuth();
                  updateAuthStatus();
                  toast.info('Authentication cleared');
                }}
                size="sm"
                variant="outline"
              >
                Clear Auth
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Cards Info */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test Card Information
            </CardTitle>
            <CardDescription>
              Use these test cards to simulate different payment scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">Success Scenarios</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Card:</strong> 4111 1111 1111 1111</p>
                  <p><strong>UPI:</strong> success@razorpay</p>
                  <p><strong>CVV:</strong> Any 3 digits</p>
                  <p><strong>Expiry:</strong> Any future date</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-red-700">Failure Scenarios</h4>
                <div className="text-sm space-y-1">
                  <p><strong>Card:</strong> 4000 0000 0000 0002</p>
                  <p><strong>UPI:</strong> failure@razorpay</p>
                  <p><strong>CVV:</strong> Any 3 digits</p>
                  <p><strong>Expiry:</strong> Any future date</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Student Information */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
              <CardDescription>
                Update student details for payment testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={studentInfo.name}
                    onChange={(e) => setStudentInfo({...studentInfo, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="enrollment">Enrollment No.</Label>
                  <Input
                    id="enrollment"
                    value={studentInfo.enrollmentNumber}
                    onChange={(e) => setStudentInfo({...studentInfo, enrollmentNumber: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={studentInfo.email}
                  onChange={(e) => setStudentInfo({...studentInfo, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={studentInfo.phone}
                  onChange={(e) => setStudentInfo({...studentInfo, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={studentInfo.department}
                  onChange={(e) => setStudentInfo({...studentInfo, department: e.target.value})}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Amount */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration</CardTitle>
              <CardDescription>
                Set payment amount and test different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Quick Amount Selection</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[500, 1000, 2500, 5000].map((amt) => (
                    <Button
                      key={amt}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(amt.toString())}
                    >
                      ₹{amt}
                    </Button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Components Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Razorpay Button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enhanced Button</CardTitle>
              <CardDescription>
                New improved Razorpay button with better error handling
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EnhancedRazorpayButton
                amount={parseFloat(amount)}
                description="Test Payment"
                feeType="tuition"
                studentName={studentInfo.name}
                studentEmail={studentInfo.email}
                studentPhone={studentInfo.phone}
                onSuccess={(data) => {
                  toast.success('Enhanced button payment successful!');
                  console.log('Enhanced Payment Success:', data);
                }}
                onError={(error) => {
                  toast.error('Enhanced button payment failed!');
                  console.error('Enhanced Payment Error:', error);
                }}
                showSecurityInfo={true}
              />
              
              <div className="text-xs text-gray-500">
                ✅ Modern design<br />
                ✅ Built-in error handling<br />
                ✅ Security indicators<br />
                ✅ Loading states
              </div>
            </CardContent>
          </Card>

          {/* Legacy Razorpay Button */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legacy Button</CardTitle>
              <CardDescription>
                Original Razorpay button (uses mock data)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RazorpayButton
                amount={parseFloat(amount)}
                description="Test Payment"
                feeType="tuition"
                onSuccess={(data) => {
                  toast.success('Legacy button payment successful!');
                  console.log('Legacy Payment Success:', data);
                }}
                onError={(error) => {
                  toast.error('Legacy button payment failed!');
                  console.error('Legacy Payment Error:', error);
                }}
              />
              
              <div className="text-xs text-gray-500">
                ⚠️ Uses mock data<br />
                ⚠️ Limited error handling<br />
                ✅ Simple integration<br />
                ✅ Quick testing
              </div>
            </CardContent>
          </Card>

          {/* Hook-based Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Custom Hook</CardTitle>
              <CardDescription>
                Using useRazorpay hook for custom implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleCustomPayment}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? 'Processing...' : `Pay ₹${amount} (Hook)`}
              </Button>
              
              <div className="text-xs text-gray-500">
                ✅ Maximum flexibility<br />
                ✅ Custom UI control<br />
                ✅ Advanced error handling<br />
                ✅ State management
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Payment Modal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Modal
            </CardTitle>
            <CardDescription>
              Full-featured payment modal with fee summary and amount selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowModal(true)} size="lg">
              Open Payment Modal
            </Button>
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Integration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Backend API</span>
                </div>
                <p className="text-green-600">Fully Integrated</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Frontend Components</span>
                </div>
                <p className="text-green-600">Ready to Use</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Payment Verification</span>
                </div>
                <p className="text-green-600">Secure & Working</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Error Handling</span>
                </div>
                <p className="text-green-600">Comprehensive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Modal */}
      <RazorpayPaymentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feeSummary={mockFeeSummary}
        studentInfo={{
          name: studentInfo.name,
          email: studentInfo.email,
          enrollmentNumber: studentInfo.enrollmentNumber,
          department: studentInfo.department
        }}
        onPaymentSuccess={() => {
          toast.success('Modal payment successful!');
          setShowModal(false);
        }}
      />

      {/* Auth Debugger (development only) */}
      <AuthDebugger />
    </div>
  );
}
