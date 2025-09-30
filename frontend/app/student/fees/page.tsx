"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "@/components/payment/payment-modal";
import { getCurrentUser } from "@/lib/auth";
import { mockFeeRecords, mockStudent, type FeeRecord } from "@/lib/mock-data";
import { downloadReceipt } from "@/components/payment/receipt";
import { 
  CreditCard, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  History
} from "lucide-react";

export default function StudentFeesPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [feeRecords, setFeeRecords] = useState(mockFeeRecords);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePayNow = (fee: FeeRecord) => {
    setSelectedFee(fee);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (feeId: string, transactionId: string) => {
    setFeeRecords(prevFees => 
      prevFees.map(fee => 
        fee.id === feeId 
          ? { 
              ...fee, 
              status: 'paid' as const, 
              paidDate: new Date().toISOString().split('T')[0],
              transactionId 
            }
          : fee
      )
    );
    setPaymentModalOpen(false);
    setSelectedFee(null);
  };

  const handleDownloadReceipt = (fee: FeeRecord) => {
    const receiptData = {
      transactionId: fee.transactionId || `TXN${Date.now()}`,
      feeType: fee.type,
      amount: fee.amount,
      paymentDate: fee.paidDate || new Date().toISOString(),
      semester: fee.semester,
      studentName: mockStudent.name,
      studentId: mockStudent.id,
      rollNumber: mockStudent.rollNumber,
      department: mockStudent.department,
      paymentMethod: "Card", // This could be stored in the fee record
      dueDate: fee.dueDate,
      academicYear: "2024-25"
    };
    
    downloadReceipt(receiptData);
  };

  const totalPaid = feeRecords.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0);
  const totalPending = feeRecords.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  const paidFees = feeRecords.filter(fee => fee.status === 'paid');
  const pendingFees = feeRecords.filter(fee => fee.status !== 'paid');

  return (
    <DashboardLayout title="Fee Management" userRole="student">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">₹{totalPending.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Due soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {feeRecords.filter(fee => fee.status === 'paid').length}/{feeRecords.length}
              </div>
              <p className="text-xs text-muted-foreground">Payments completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {mockStudent.name}</p>
                <p><strong>Roll Number:</strong> {mockStudent.rollNumber}</p>
              </div>
              <div>
                <p><strong>Department:</strong> {mockStudent.department}</p>
                <p><strong>Current Semester:</strong> {mockStudent.semester}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Fees */}
        {pendingFees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Pending Fees
              </CardTitle>
              <CardDescription>Outstanding fee payments that require your attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingFees.map((fee) => (
                  <div key={fee.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50/30 hover:bg-orange-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(fee.status)}
                        <div>
                          <h3 className="font-semibold">
                            {fee.type.charAt(0).toUpperCase() + fee.type.slice(1)} Fee
                          </h3>
                          <p className="text-sm text-gray-600">{fee.semester}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-orange-700">₹{fee.amount.toLocaleString()}</p>
                        <Badge className={getStatusColor(fee.status)}>
                          {fee.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Due Date</p>
                        <p>{new Date(fee.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Days {new Date(fee.dueDate) < new Date() ? 'Overdue' : 'Remaining'}</p>
                        <p className={new Date(fee.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          {Math.abs(Math.ceil((new Date(fee.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                        </p>
                      </div>
                      <div>
                        <p className="font-medium">Semester</p>
                        <p>{fee.semester}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handlePayNow(fee)}
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment History */}
        {paidFees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-green-600" />
                Payment History
              </CardTitle>
              <CardDescription>Successfully completed fee payments with downloadable receipts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paidFees.map((fee) => (
                  <div key={fee.id} className="border border-green-200 rounded-lg p-4 bg-green-50/30 hover:bg-green-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold">
                            {fee.type.charAt(0).toUpperCase() + fee.type.slice(1)} Fee
                          </h3>
                          <p className="text-sm text-gray-600">{fee.semester}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-700">₹{fee.amount.toLocaleString()}</p>
                        <Badge className="bg-green-100 text-green-800">
                          PAID
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="font-medium">Due Date</p>
                        <p>{new Date(fee.dueDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Paid Date</p>
                        <p className="text-green-600 font-medium">{fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Transaction ID</p>
                        <p className="text-xs text-gray-500 font-mono">{fee.transactionId || 'N/A'}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadReceipt(fee)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Receipt
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <p>Click &quot;Pay Now&quot; button next to any pending fee</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <p>Choose your preferred payment method (Net Banking, UPI, Cards)</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <p>Complete the payment and download your receipt</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg mt-4">
                <p className="text-blue-800 text-sm">
                  <strong>Note:</strong> All payments are processed securely. Receipts will be automatically 
                  generated and available for download immediately after successful payment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {selectedFee && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setSelectedFee(null);
            }}
            feeRecord={selectedFee}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
