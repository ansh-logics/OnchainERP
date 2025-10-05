"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RazorpayPaymentModal } from "@/components/payment/razorpay-payment-modal";
import { downloadReceipt } from "@/components/payment/receipt";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { mockFeeRecords, mockFeeSummary, mockStudent } from "@/lib/mock-data";
import { toast } from "sonner";
import { 
  CreditCard, 
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  History,
  DollarSign
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

interface StudentProfile {
  id: string;
  name: string;  
  email: string;
  rollNumber: string;
  enrollmentNumber: string;
  department: string;
  section: string;
  currentSemester: number;
  cgpa: number;
}

interface FeesData {
  fees: FeeRecord[];
  summary: {
    totalAmount: number;
    totalPaid: number;
    totalPending: number;
    paidCount: number;
    pendingCount: number;
  };
}

export default function StudentFeesPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    fetchFeesData();
    fetchFeeSummary();
  }, [router]);

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        router.push('/login');
        return;
      }

      const [feesRes, profileRes] = await Promise.all([
        fetch('/api/student-services/fees', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch('/api/student-services/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (feesRes.status === 401 || profileRes.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        router.push('/login');
        return;
      }
      
      if (feesRes.ok) {
        const feesData = await feesRes.json();
        if (feesData.success) {
          setFeeRecords(feesData.data.fees || []);
          setSummary(feesData.data.summary);
        } else {
          toast.error(feesData.message || 'Failed to fetch fees data');
        }
      } else {
        const errorData = await feesRes.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to fetch fees data');
      }
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setStudentProfile(profileData.data);
        }
      }
    } catch (error: any) {
      console.error('Error fetching fees data:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeSummary = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const response = await fetch('/api/student-services/fee-summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setFeeSummary(data.data);
        } else {
          toast.error(data.message || 'Failed to fetch fee summary');
        }
      } else if (response.status === 401) {
        localStorage.removeItem('authToken');
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Error fetching fee summary:', error);
      toast.error('Failed to fetch fee summary');
    }
  };

  const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (feeSummary && parseFloat(paymentAmount) > (feeSummary.remainingAmount || feeSummary.pendingAmount)) {
      toast.error('Payment amount exceeds remaining balance');
      return;
    }

    try {
      setProcessing(true);
      const response = await api.post('/api/student-services/pay', {
        amount: parseFloat(paymentAmount)
      });

      if (response.data.success) {
        toast.success('Payment processed successfully!');
        setShowPaymentModal(false);
        setPaymentAmount('');
        fetchFeeSummary();
        fetchFeesData();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="Fee Management" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading fees data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
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

  const handlePayNow = (fee?: FeeRecord) => {
    setShowPaymentModal(true);
  };

  const handleDownloadReceipt = (fee: FeeRecord) => {
    const receiptData = {
      transactionId: fee.transactionId || `TXN${Date.now()}`,
      feeType: fee.feeType || fee.category || 'General Fee',
      amount: fee.amount,
      paymentDate: fee.paidDate || new Date().toISOString(),
      semester: `Semester ${studentProfile?.currentSemester || 'N/A'}`,
      studentName: studentProfile?.user.name || 'N/A',
      studentId: studentProfile?.id || 'N/A',
      rollNumber: studentProfile?.rollNumber || 'N/A',
      department: studentProfile?.department?.name || 'N/A',
      paymentMethod: "Card",
      dueDate: fee.dueDate,
      academicYear: "2024-25"
    };
    
    downloadReceipt(receiptData);
  };

  const totalPaid = summary?.totalPaid || 0;
  const totalPending = summary?.totalPending || 0;
  const paidFees = feeRecords.filter(fee => fee.status === 'paid');
  const pendingFees = feeRecords.filter(fee => fee.status !== 'paid');

  return (
    <DashboardLayout title="Fee Management" userRole="student">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(feeSummary?.totalAmount || feeSummary?.totalFees || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This academic year</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₹{feeSummary?.paidAmount.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">Successfully paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Remaining Balance</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">₹{(feeSummary?.remainingAmount || feeSummary?.pendingAmount || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">To be paid</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge className={`text-lg px-3 py-1 ${
                feeSummary?.feeStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                feeSummary?.feeStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {feeSummary?.feeStatus || 'Unpaid'}
              </Badge>
              {feeSummary && (feeSummary.remainingAmount || feeSummary.pendingAmount || 0) > 0 && (
                <div className="mt-3 space-y-2">
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowRazorpayModal(true)}
                  >
                    Pay with Razorpay
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePayNow()}
                  >
                    Quick Pay
                  </Button>
                </div>
              )}
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
                <p><strong>Name:</strong> {studentProfile?.user.name || 'N/A'}</p>
                <p><strong>Roll Number:</strong> {studentProfile?.rollNumber || 'N/A'}</p>
              </div>
              <div>
                <p><strong>Department:</strong> {studentProfile?.department?.name || 'N/A'}</p>
                <p><strong>Current Semester:</strong> {studentProfile?.currentSemester || 'N/A'}</p>
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
                            {(fee.feeType || fee.type || 'General').charAt(0).toUpperCase() + (fee.feeType || fee.type || 'General').slice(1)} Fee
                          </h3>
                          <p className="text-sm text-gray-600">Semester {fee.semester}</p>
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
                        <p className="font-medium">Category</p>
                        <p>{fee.feeType || fee.category || 'General'}</p>
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
                            {(fee.feeType || fee.type || 'General').charAt(0).toUpperCase() + (fee.feeType || fee.type || 'General').slice(1)} Fee
                          </h3>
                          <p className="text-sm text-gray-600">Semester {fee.semester}</p>
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
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make Fee Payment</DialogTitle>
              <DialogDescription>
                Enter the amount you want to pay towards your fees
              </DialogDescription>
            </DialogHeader>
            
            {feeSummary && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                    <p className="text-lg font-semibold">₹{(feeSummary.totalAmount || feeSummary.totalFees || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                    <p className="text-lg font-semibold text-green-600">₹{feeSummary.paidAmount.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Remaining Balance</p>
                    <p className="text-2xl font-bold text-red-600">₹{(feeSummary.remainingAmount || feeSummary.pendingAmount || 0).toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    max={feeSummary.remainingAmount || feeSummary.pendingAmount || 0}
                    min="1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum: ₹{(feeSummary.remainingAmount || feeSummary.pendingAmount || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentModal(false)} disabled={processing}>
                Cancel
              </Button>
              <Button onClick={handlePayment} disabled={processing}>
                {processing ? 'Processing...' : 'Pay Now'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Razorpay Payment Modal */}
        {feeSummary && (
          <RazorpayPaymentModal
            isOpen={showRazorpayModal}
            onClose={() => setShowRazorpayModal(false)}
            feeSummary={{
              totalFees: feeSummary.totalAmount || feeSummary.totalFees || 0,
              paidAmount: feeSummary.paidAmount || 0,
              remainingAmount: feeSummary.remainingAmount || feeSummary.pendingAmount || 0,
              feeStatus: feeSummary.feeStatus || 'Unpaid'
            }}
            studentInfo={{
              name: studentProfile?.user?.name || '',
              email: studentProfile?.user?.email || '',
              enrollmentNumber: studentProfile?.enrollmentNumber || '',
              department: studentProfile?.department?.name || ''
            }}
            onPaymentSuccess={() => {
              fetchFeeSummary();
              fetchFeesData();
              setShowRazorpayModal(false);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
