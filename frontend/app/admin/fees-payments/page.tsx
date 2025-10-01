"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import { 
  CreditCard,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Receipt,
  Calendar,
  User,
  Plus,
  Send,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart,
  FileText,
  Mail,
  Phone,
  Edit,
  Trash2
} from "lucide-react";

interface FeeTransaction {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  semester: string;
  feeType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial' | 'refunded';
  paymentMethod?: string;
  transactionId?: string;
  receiptNumber?: string;
  lateFee?: number;
  discount?: number;
  remarks?: string;
}

export default function FeesPaymentsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedFeeType, setSelectedFeeType] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push('/auth/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const transactions: FeeTransaction[] = [
    {
      id: "1",
      studentId: "YU2024001",
      studentName: "Arjun Sharma",
      rollNumber: "21CS001",
      course: "B.Tech CSE",
      semester: "Semester 6",
      feeType: "Tuition Fee",
      amount: 75000,
      dueDate: "2024-07-15",
      paidDate: "2024-07-12",
      status: "paid",
      paymentMethod: "Online Banking",
      transactionId: "TXN123456789",
      receiptNumber: "RCP2024001"
    },
    {
      id: "2",
      studentId: "YU2024002",
      studentName: "Priya Patel",
      rollNumber: "21EC002",
      course: "B.Tech ECE",
      semester: "Semester 6",
      feeType: "Tuition Fee",
      amount: 75000,
      dueDate: "2024-07-15",
      status: "pending"
    },
    {
      id: "3",
      studentId: "YU2024003",
      studentName: "Rahul Singh",
      rollNumber: "22MBA001",
      course: "MBA",
      semester: "Semester 2",
      feeType: "Tuition Fee",
      amount: 125000,
      dueDate: "2024-06-30",
      status: "overdue",
      lateFee: 2500
    },
    {
      id: "4",
      studentId: "YU2024004",
      studentName: "Sneha Gupta",
      rollNumber: "21CS003",
      course: "B.Tech CSE",
      semester: "Semester 6",
      feeType: "Exam Fee",
      amount: 5000,
      dueDate: "2024-07-20",
      paidDate: "2024-07-18",
      status: "paid",
      paymentMethod: "UPI",
      transactionId: "UPI123456",
      receiptNumber: "RCP2024002"
    },
    {
      id: "5",
      studentId: "YU2024005",
      studentName: "Amit Kumar",
      rollNumber: "21ME001",
      course: "B.Tech ME",
      semester: "Semester 6",
      feeType: "Hostel Fee",
      amount: 25000,
      dueDate: "2024-07-10",
      paidDate: "2024-07-05",
      status: "paid",
      paymentMethod: "Debit Card",
      transactionId: "CARD789123",
      receiptNumber: "RCP2024003",
      discount: 2500
    },
    {
      id: "6",
      studentId: "YU2024006",
      studentName: "Pooja Verma",
      rollNumber: "21BBA001",
      course: "BBA",
      semester: "Semester 4",
      feeType: "Library Fee",
      amount: 3000,
      dueDate: "2024-08-01",
      status: "pending"
    }
  ];

  const semesters = ["All Semesters", "Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5", "Semester 6", "Semester 7", "Semester 8"];
  const feeTypes = ["All Types", "Tuition Fee", "Exam Fee", "Hostel Fee", "Library Fee", "Lab Fee", "Transport Fee", "Miscellaneous"];

  const filteredTransactions = transactions.filter(transaction =>
    (selectedStatus === "all" || transaction.status === selectedStatus) &&
    (selectedSemester === "all" || selectedSemester === "All Semesters" || transaction.semester === selectedSemester) &&
    (selectedFeeType === "all" || selectedFeeType === "All Types" || transaction.feeType === selectedFeeType) &&
    (transaction.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      case 'partial': return Clock;
      case 'refunded': return RefreshCw;
      default: return AlertCircle;
    }
  };

  const feeStats = {
    totalTransactions: transactions.length,
    totalCollected: transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0),
    totalPending: transactions.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((sum, t) => sum + t.amount, 0),
    totalOverdue: transactions.filter(t => t.status === 'overdue').reduce((sum, t) => sum + t.amount, 0),
    paid: transactions.filter(t => t.status === 'paid').length,
    pending: transactions.filter(t => t.status === 'pending').length,
    overdue: transactions.filter(t => t.status === 'overdue').length
  };

  return (
    <DashboardLayout title="Fees & Payments" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fees & Payments Management</h2>
            <p className="text-muted-foreground">Manage student fee collections and payment tracking</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Reports
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Reminders
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Manual Payment
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₹{(feeStats.totalCollected / 100000).toFixed(1)}L</p>
                <p className="text-sm text-gray-600">Total Collected</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">₹{(feeStats.totalPending / 100000).toFixed(1)}L</p>
                <p className="text-sm text-gray-600">Total Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">₹{(feeStats.totalOverdue / 100000).toFixed(1)}L</p>
                <p className="text-sm text-gray-600">Overdue Amount</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{feeStats.paid}</p>
                <p className="text-sm text-gray-600">Paid</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{feeStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{feeStats.overdue}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester} value={semester === "All Semesters" ? "all" : semester}>
                          {semester}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by fee type" />
                    </SelectTrigger>
                    <SelectContent>
                      {feeTypes.map((type) => (
                        <SelectItem key={type} value={type === "All Types" ? "all" : type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);
                const totalAmount = transaction.amount + (transaction.lateFee || 0) - (transaction.discount || 0);
                
                return (
                  <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{transaction.studentName}</h3>
                            <p className="text-sm text-gray-600">Roll: {transaction.rollNumber} | ID: {transaction.studentId}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{transaction.course}</Badge>
                              <Badge variant="outline">{transaction.semester}</Badge>
                              <Badge variant="outline">{transaction.feeType}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(transaction.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {transaction.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">Due: {transaction.dueDate}</p>
                        </div>
                      </div>

                      {/* Amount Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">₹{transaction.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Fee Amount</p>
                        </div>
                        {transaction.lateFee && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">₹{transaction.lateFee.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">Late Fee</p>
                          </div>
                        )}
                        {transaction.discount && (
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">-₹{transaction.discount.toLocaleString()}</p>
                            <p className="text-xs text-gray-600">Discount</p>
                          </div>
                        )}
                        <div className="text-center">
                          <p className="text-lg font-bold text-purple-600">₹{totalAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-600">Total Amount</p>
                        </div>
                      </div>

                      {/* Payment Details */}
                      {transaction.status === 'paid' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-3 bg-green-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">Payment Date</p>
                            <p className="text-sm text-gray-600">{transaction.paidDate}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Payment Method</p>
                            <p className="text-sm text-gray-600">{transaction.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Transaction ID</p>
                            <p className="text-sm text-gray-600 font-mono">{transaction.transactionId}</p>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        
                        {transaction.status === 'paid' && (
                          <Button variant="outline" size="sm">
                            <Receipt className="h-4 w-4 mr-2" />
                            Receipt
                          </Button>
                        )}
                        
                        {(transaction.status === 'pending' || transaction.status === 'overdue') && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Record Payment
                            </Button>
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Reminder
                            </Button>
                          </>
                        )}
                        
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Collections</CardTitle>
                  <CardDescription>Fee collections for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">Online Payments</p>
                        <p className="text-sm text-gray-600">15 transactions</p>
                      </div>
                      <p className="text-lg font-bold text-green-600">₹2,85,000</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="font-medium">Cash Payments</p>
                        <p className="text-sm text-gray-600">3 transactions</p>
                      </div>
                      <p className="text-lg font-bold text-blue-600">₹45,000</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="font-medium">DD/Cheque</p>
                        <p className="text-sm text-gray-600">2 transactions</p>
                      </div>
                      <p className="text-lg font-bold text-purple-600">₹1,50,000</p>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">Total Collections</p>
                        <p className="text-xl font-bold text-gray-800">₹4,80,000</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Distribution of payment modes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { method: "Online Banking", percentage: 45, amount: "₹13.5L" },
                      { method: "UPI", percentage: 30, amount: "₹9L" },
                      { method: "Debit/Credit Card", percentage: 15, amount: "₹4.5L" },
                      { method: "Cash", percentage: 7, amount: "₹2.1L" },
                      { method: "DD/Cheque", percentage: 3, amount: "₹0.9L" }
                    ].map((method, index) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{method.method}</span>
                          <span>{method.amount} ({method.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${method.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Collection Summary by Course</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["B.Tech", "MBA", "BBA", "BCA", "M.Tech"].map((course) => {
                    const courseTransactions = transactions.filter(t => t.course.includes(course) && t.status === 'paid');
                    const totalCollected = courseTransactions.reduce((sum, t) => sum + t.amount, 0);
                    const pendingTransactions = transactions.filter(t => t.course.includes(course) && t.status !== 'paid');
                    const totalPending = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
                    
                    return (
                      <Card key={course} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-2">{course}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Collected</span>
                              <span className="text-sm font-medium text-green-600">₹{(totalCollected / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Pending</span>
                              <span className="text-sm font-medium text-red-600">₹{(totalPending / 100000).toFixed(1)}L</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Collection Rate</span>
                              <span className="text-sm font-medium">
                                {totalCollected + totalPending > 0 ? Math.round((totalCollected / (totalCollected + totalPending)) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Reports</CardTitle>
                  <CardDescription>Create custom fee collection reports</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>From Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>To Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collection">Collection Summary</SelectItem>
                        <SelectItem value="outstanding">Outstanding Fees</SelectItem>
                        <SelectItem value="defaulters">Fee Defaulters</SelectItem>
                        <SelectItem value="refunds">Refund Report</SelectItem>
                        <SelectItem value="analysis">Payment Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Course Filter</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="btech">B.Tech</SelectItem>
                        <SelectItem value="mba">MBA</SelectItem>
                        <SelectItem value="bba">BBA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Reports</CardTitle>
                  <CardDescription>Pre-configured reports for common use cases</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Today's Collections
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <PieChart className="h-4 w-4 mr-2" />
                    Monthly Summary
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Overdue Payments
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Collection Trends
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refund History
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Automated Reminders</CardTitle>
                <CardDescription>Configure and send payment reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Reminder Settings</h4>
                    <div className="space-y-2">
                      <Label>Days before due date</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select days" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 days</SelectItem>
                          <SelectItem value="7">7 days</SelectItem>
                          <SelectItem value="15">15 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Reminder frequency</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Reminder Channels</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <label className="text-sm">Email Notifications</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <label className="text-sm">SMS Notifications</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <label className="text-sm">WhatsApp Messages</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" />
                        <label className="text-sm">Push Notifications</label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Bulk Reminders</h4>
                  <div className="flex gap-4">
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Send to All Pending
                    </Button>
                    <Button variant="outline">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Send to Overdue
                    </Button>
                    <Button variant="outline">
                      <Clock className="h-4 w-4 mr-2" />
                      Schedule Reminders
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Management Settings</CardTitle>
                <CardDescription>Configure fee structure and payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Payment Settings</h4>
                    <div className="space-y-2">
                      <Label>Late Fee Percentage (%)</Label>
                      <Input type="number" defaultValue="2" />
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Period (days)</Label>
                      <Input type="number" defaultValue="7" />
                    </div>
                    <div className="space-y-2">
                      <Label>Payment Gateway</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gateway" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="razorpay">Razorpay</SelectItem>
                          <SelectItem value="payu">PayU</SelectItem>
                          <SelectItem value="instamojo">Instamojo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Discount Settings</h4>
                    <div className="space-y-2">
                      <Label>Early Payment Discount (%)</Label>
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sibling Discount (%)</Label>
                      <Input type="number" defaultValue="10" />
                    </div>
                    <div className="space-y-2">
                      <Label>Merit Scholarship (%)</Label>
                      <Input type="number" defaultValue="25" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Accepted Payment Methods</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Online Banking", "UPI", "Debit Card", "Credit Card", "Cash", "DD/Cheque", "NEFT/RTGS", "Wallet"].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked />
                        <label className="text-sm">{method}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
