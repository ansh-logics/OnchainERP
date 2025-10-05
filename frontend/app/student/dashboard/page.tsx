"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RazorpayPaymentModal } from "@/components/payment/razorpay-payment-modal";
import { getCurrentUser } from "@/lib/auth";
import { 
  mockDashboardData,
  mockFeeSummary,
  mockTodaySchedule,
  mockRecentGrades,
  mockAssignments,
} from "@/lib/mock-data";
import { 
  BookOpen, 
  CreditCard, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  GraduationCap,
  DollarSign
} from "lucide-react";

interface FeeSummary {
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  feeStatus: 'Paid' | 'Partial' | 'Unpaid';
}

interface FeeRecord {
  id: string;
  category: string;
  amount: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

interface ExamRecord {
  id: string;
  subject: string;
  examType: string;
  examDate: string;
  totalMarks: number;
}

interface DashboardData {
  student: {
    id: string;
    name: string;
    email: string;
    rollNumber: string;
    enrollmentNumber: string;
    department: string;
    section: string;
    currentSemester: number;
    cgpa: number;
  };
  analytics: {
    attendance: number;
    cgpa: number;
    enrolledCourses: number;
    currentSemester: number;
    creditsCompleted: number;
    totalCredits: number;
  };
  pendingFees: {
    count: number;
    totalAmount: number;
    fees: FeeRecord[];
  };
  upcomingExams: ExamRecord[];
  notifications: any[];
}

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [feeSummary, setFeeSummary] = useState<FeeSummary | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRazorpayModal, setShowRazorpayModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'student') {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }
    setUser(currentUser);
    fetchDashboardData();
    fetchFeeSummary();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Simulate API delay for realistic experience
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use mock data instead of API call
      setDashboardData(mockDashboardData);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeSummary = async () => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Use mock data instead of API call
      setFeeSummary(mockFeeSummary);
    } catch (error: any) {
      console.error('Error fetching fee summary:', error);
    }
  };

    const handlePayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (feeSummary && parseFloat(paymentAmount) > feeSummary.remainingAmount) {
      alert('Payment amount exceeds remaining balance');
      return;
    }

    try {
      setProcessing(true);
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update mock fee summary
      if (feeSummary) {
        const newPaidAmount = feeSummary.paidAmount + parseFloat(paymentAmount);
        const newRemainingAmount = feeSummary.totalFees - newPaidAmount;
        
        setFeeSummary({
          ...feeSummary,
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          feeStatus: newRemainingAmount === 0 ? 'Paid' : 'Partial',
        });
      }

      alert('Payment successful! This is a demo payment.');
      setShowPaymentModal(false);
      setPaymentAmount('');
      fetchDashboardData();
    } catch (error: any) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="Student Dashboard" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout title="Student Dashboard" userRole="student">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No dashboard data available</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { student, analytics, pendingFees, upcomingExams } = dashboardData;
  const recentFees = pendingFees.fees.slice(0, 3);

  return (
    <DashboardLayout title="Student Dashboard" userRole="student">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {student.name}!</h2>
          <p className="text-blue-100">
            {student.rollNumber} • {student.department} • Semester {analytics.currentSemester}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CGPA</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{analytics.cgpa}</div>
              <p className="text-xs text-muted-foreground">Out of 10.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{analytics.attendance}%</div>
              <Progress value={analytics.attendance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fee Status</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {feeSummary ? (
                <>
                  <div className={`text-2xl font-bold ${
                    feeSummary.feeStatus === 'Paid' ? 'text-green-600' :
                    feeSummary.feeStatus === 'Partial' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    ₹{feeSummary.remainingAmount.toLocaleString()}
                  </div>
                  <Badge className={`mt-1 ${
                    feeSummary.feeStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                    feeSummary.feeStatus === 'Partial' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {feeSummary.feeStatus}
                  </Badge>
                  {feeSummary.remainingAmount > 0 && (
                    <div className="mt-2 space-y-1">
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
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Quick Pay
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Loading...</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.currentSemester}</div>
              <p className="text-xs text-muted-foreground">Active semester</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Fee Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Fee Payments
              </CardTitle>
              <CardDescription>Your latest fee transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentFees.length > 0 ? (
                  <>
                    {recentFees.map((fee: FeeRecord) => (
                      <div key={fee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            fee.status === 'paid' ? 'bg-green-100' :
                            fee.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                          }`}>
                            {fee.status === 'paid' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{fee.category}</p>
                            <p className="text-sm text-gray-600">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{parseFloat(fee.amount).toLocaleString()}</p>
                          <Badge variant={fee.status === 'paid' ? 'default' : 'secondary'}>
                            {fee.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => router.push('/student/fees')}>
                        View All Payments
                      </Button>
                      <Button variant="outline" onClick={() => router.push('/student/receipts')}>
                        View Receipts
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">No pending fees</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Exams */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Exams
              </CardTitle>
              <CardDescription>Your scheduled examinations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingExams.length > 0 ? (
                  <>
                    {upcomingExams.map((exam: ExamRecord) => (
                      <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{exam.subject}</p>
                          <p className="text-sm text-gray-600">{exam.examType?.toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{new Date(exam.examDate).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">Max: {exam.totalMarks}</p>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full" onClick={() => router.push('/student/exams')}>
                      View Exam Schedule
                    </Button>
                  </>
                ) : (
                  <p className="text-center text-gray-500 py-4">No upcoming exams</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Schedule
              </CardTitle>
              <CardDescription>Your classes for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTodaySchedule.map((schedule, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <p className="text-sm font-medium">{schedule.time}</p>
                        <Badge variant="outline" className="text-xs">
                          {schedule.type}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{schedule.course}</p>
                        <p className="text-xs text-gray-600">
                          {schedule.room} • {schedule.instructor}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push('/student/timetable')}>
                  View Full Timetable
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Recent Grades
              </CardTitle>
              <CardDescription>Your latest academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRecentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{grade.course}</p>
                      <p className="text-xs text-gray-600">{grade.assignment}</p>
                      <p className="text-xs text-gray-500">{new Date(grade.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="text-sm font-bold">
                        {grade.grade}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{grade.points}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push('/student/grades')}>
                  View All Grades
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Upcoming Assignments
            </CardTitle>
            <CardDescription>Assignments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockAssignments.map((assignment) => (
                <div key={assignment.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <Badge variant={assignment.status === 'pending' ? 'destructive' : assignment.status === 'submitted' ? 'default' : 'secondary'}>
                      {assignment.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{assignment.course} ({assignment.courseCode})</p>
                  <p className="text-xs text-gray-500 mb-3">{assignment.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                    <span className="font-medium">
                      {assignment.obtainedMarks ? `${assignment.obtainedMarks}/${assignment.totalMarks}` : `${assignment.totalMarks} marks`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={() => router.push('/student/assignments')}>
                View All Assignments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/student/fees')}>
                <CreditCard className="h-5 w-5" />
                Pay Fees
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/student/receipts')}>
                <CheckCircle className="h-5 w-5" />
                Receipts
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/student/exams')}>
                <Calendar className="h-5 w-5" />
                Exam Results
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/student/courses')}>
                <BookOpen className="h-5 w-5" />
                Course Materials
              </Button>
              <Button variant="outline" className="h-16 flex-col gap-2" onClick={() => router.push('/support')}>
                <AlertCircle className="h-5 w-5" />
                Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Razorpay Payment Modal */}
      {feeSummary && (
        <RazorpayPaymentModal
          isOpen={showRazorpayModal}
          onClose={() => setShowRazorpayModal(false)}
          feeSummary={feeSummary}
          studentInfo={{
            name: user?.name || '',
            email: user?.email || '',
            enrollmentNumber: dashboardData?.student?.enrollmentNumber || '',
            department: dashboardData?.student?.department?.name || ''
          }}
          onPaymentSuccess={() => {
            fetchFeeSummary();
            fetchDashboardData();
            setShowRazorpayModal(false);
          }}
        />
      )}

      {/* Legacy Payment Modal */}
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
                  <p className="text-lg font-semibold">₹{feeSummary.totalFees.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid Amount</p>
                  <p className="text-lg font-semibold text-green-600">₹{feeSummary.paidAmount.toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Remaining Balance</p>
                  <p className="text-2xl font-bold text-red-600">₹{feeSummary.remainingAmount.toLocaleString()}</p>
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
                  max={feeSummary.remainingAmount}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: ₹{feeSummary.remainingAmount.toLocaleString()}
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
    </DashboardLayout>
  );
}
