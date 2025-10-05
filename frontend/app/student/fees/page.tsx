"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { mockFeeRecords, mockFeeSummary, mockStudent } from "@/lib/mock-data";
import { PaymentModal } from "@/components/payment/payment-modal";
import { RazorpayButton } from "@/components/payment/razorpay-button";
import { toast } from "sonner";
import { 
  CreditCard, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  History,
  DollarSign,
  Loader2
} from "lucide-react";

interface FeeRecord {
  id: string;
  studentId: string;
  semester: string;
  category: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'tuition' | 'hostel' | 'exam' | 'library';
  transactionId?: string;
}

interface FeeSummary {
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  feeStatus: 'Paid' | 'Partial' | 'Unpaid';
}

export default function StudentFeesPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<FeeRecord | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadMockData();
  }, [router]);

  const loadMockData = async () => {
    try {
      setLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setFeeSummary(mockFeeSummary);
      setFeeRecords(mockFeeRecords);
    } catch (error) {
      toast.error('Failed to load fee data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (feeId: string, transactionId: string) => {
    // Update the fee record to paid status
    setFeeRecords(prev => prev.map(fee => 
      fee.id === feeId 
        ? { 
            ...fee, 
            status: 'paid' as const, 
            paidDate: new Date().toISOString(),
            transactionId 
          }
        : fee
    ));

    // Update fee summary
    if (feeSummary && selectedFeeRecord) {
      const paidAmount = parseFloat(selectedFeeRecord.amount);
      const newPaidAmount = feeSummary.paidAmount + paidAmount;
      const newRemainingAmount = feeSummary.totalFees - newPaidAmount;
      
      setFeeSummary({
        ...feeSummary,
        paidAmount: newPaidAmount,
        remainingAmount: newRemainingAmount,
        feeStatus: newRemainingAmount === 0 ? 'Paid' : 'Partial',
      });
    }

    setShowPaymentModal(false);
    setSelectedFeeRecord(null);
    toast.success('Payment completed successfully!');
  };

  const openPaymentModal = (feeRecord: FeeRecord) => {
    setSelectedFeeRecord(feeRecord);
    setShowPaymentModal(true);
  };

  const handleDownloadReceipt = (fee: FeeRecord) => {
    toast.success('Receipt downloaded! This is a demo feature.');
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="Fee Management" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading fee information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const pendingFees = feeRecords.filter(fee => fee.status === 'pending');
  const paidFees = feeRecords.filter(fee => fee.status === 'paid');

  return (
    <DashboardLayout title="Fee Management" userRole="student">
      <div className="space-y-6">
        {/* Fee Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{feeSummary?.totalFees.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Academic Year 2024-25</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{feeSummary?.paidAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Successfully processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Amount</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{feeSummary?.remainingAmount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Due for payment</p>
              {feeSummary && feeSummary.remainingAmount > 0 && pendingFees.length > 0 && (
                <Button 
                  className="mt-2 w-full" 
                  size="sm"
                  onClick={() => openPaymentModal(pendingFees[0])}
                >
                  Pay Now
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Information */}
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
                <p><strong>Current Semester:</strong> {mockStudent.currentSemester}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Fees */}
        {pendingFees.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Pending Fees ({pendingFees.length})
              </CardTitle>
              <CardDescription>Fees that require payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-full">
                        <Clock className="h-4 w-4 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {fee.category}
                        </h4>
                        <p className="text-sm text-muted-foreground">{fee.semester}</p>
                        <p className="text-sm text-red-600">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">₹{parseFloat(fee.amount).toLocaleString()}</p>
                      <Badge variant="destructive">Pending</Badge>
                      <div className="mt-2 space-x-2">
                        <Button size="sm" onClick={() => openPaymentModal(fee)}>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Payment History
            </CardTitle>
            <CardDescription>Your completed fee payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paidFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {fee.category}
                      </h4>
                      <p className="text-sm text-muted-foreground">{fee.semester}</p>
                      <p className="text-sm text-green-600">
                        Paid: {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : 'N/A'}
                      </p>
                      {fee.transactionId && (
                        <p className="text-xs text-muted-foreground">TXN: {fee.transactionId}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">₹{parseFloat(fee.amount).toLocaleString()}</p>
                    <Badge variant="default">Paid</Badge>
                    <div className="mt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadReceipt(fee)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Modal */}
        {selectedFeeRecord && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => {
              setShowPaymentModal(false);
              setSelectedFeeRecord(null);
            }}
            feeRecord={{
              id: selectedFeeRecord.id,
              type: selectedFeeRecord.type,
              amount: parseFloat(selectedFeeRecord.amount),
              dueDate: selectedFeeRecord.dueDate,
              semester: selectedFeeRecord.semester,
              status: selectedFeeRecord.status,
              paidDate: selectedFeeRecord.paidDate,
              transactionId: selectedFeeRecord.transactionId,
            }}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
