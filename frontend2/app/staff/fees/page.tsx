"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { mockFeeRecords } from "@/lib/mock-data";
import { 
  Search,
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Eye,
  Filter,
  Download,
  Receipt,
  Calendar,
  TrendingUp
} from "lucide-react";

export default function StaffFeesPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'staff') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock student fee data
  const studentFees = [
    {
      id: '1',
      studentName: 'Priya Sharma',
      rollNumber: 'CS21B001',
      department: 'Computer Science',
      semester: 'Semester 7',
      totalFees: 47000,
      paidAmount: 0,
      dueAmount: 47000,
      dueDate: '2024-07-15',
      status: 'pending',
      feeBreakdown: [
        { type: 'tuition', amount: 45000, status: 'pending' },
        { type: 'exam', amount: 2000, status: 'pending' }
      ],
      lastPayment: null
    },
    {
      id: '2',
      studentName: 'Rahul Kumar',
      rollNumber: 'ME21B045',
      department: 'Mechanical Engineering',
      semester: 'Semester 6',
      totalFees: 62000,
      paidAmount: 60000,
      dueAmount: 2000,
      dueDate: '2024-06-30',
      status: 'partial',
      feeBreakdown: [
        { type: 'tuition', amount: 45000, status: 'paid' },
        { type: 'hostel', amount: 15000, status: 'paid' },
        { type: 'exam', amount: 2000, status: 'pending' }
      ],
      lastPayment: '2024-01-15'
    },
    {
      id: '3',
      studentName: 'Amit Patel',
      rollNumber: 'EC21B023',
      department: 'Electronics',
      semester: 'Semester 6',
      totalFees: 60000,
      paidAmount: 60000,
      dueAmount: 0,
      dueDate: '2024-01-15',
      status: 'paid',
      feeBreakdown: [
        { type: 'tuition', amount: 45000, status: 'paid' },
        { type: 'hostel', amount: 15000, status: 'paid' }
      ],
      lastPayment: '2024-01-12'
    },
    {
      id: '4',
      studentName: 'Sneha Reddy',
      rollNumber: 'CV21B089',
      department: 'Civil Engineering',
      semester: 'Semester 5',
      totalFees: 45000,
      paidAmount: 0,
      dueAmount: 45000,
      dueDate: '2024-01-15',
      status: 'overdue',
      feeBreakdown: [
        { type: 'tuition', amount: 45000, status: 'overdue' }
      ],
      lastPayment: null
    }
  ];

  // Recent transactions
  const recentTransactions = [
    { id: '1', student: 'John Doe', amount: 45000, type: 'Tuition Fee', method: 'UPI', date: '2024-03-15', status: 'completed' },
    { id: '2', student: 'Jane Smith', amount: 15000, type: 'Hostel Fee', method: 'Card', date: '2024-03-15', status: 'completed' },
    { id: '3', student: 'Mike Johnson', amount: 2000, type: 'Exam Fee', method: 'Net Banking', date: '2024-03-14', status: 'pending' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'partial': return <CreditCard className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const filteredFees = studentFees.filter(fee => 
    selectedTab === 'all' ? true : fee.status === selectedTab
  ).filter(fee => 
    fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: studentFees.length,
    paid: studentFees.filter(fee => fee.status === 'paid').length,
    pending: studentFees.filter(fee => fee.status === 'pending').length,
    partial: studentFees.filter(fee => fee.status === 'partial').length,
    overdue: studentFees.filter(fee => fee.status === 'overdue').length,
    totalCollection: studentFees.reduce((sum, fee) => sum + fee.paidAmount, 0),
    pendingAmount: studentFees.reduce((sum, fee) => sum + fee.dueAmount, 0),
  };

  return (
    <DashboardLayout title="Fee Collection" userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Fee Collection Management</h2>
            <p className="text-gray-600">Track and manage student fee payments</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold text-green-600">₹{stats.totalCollection.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total Collected</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-xl font-bold text-orange-600">₹{stats.pendingAmount.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{stats.paid}</div>
                  <p className="text-sm text-gray-600">Fully Paid</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-xl font-bold text-red-600">{stats.overdue}</div>
                  <p className="text-sm text-gray-600">Overdue</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Fee Records */}
            <Card>
              <CardHeader>
                <CardTitle>Student Fee Records</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="partial">Partial</TabsTrigger>
                    <TabsTrigger value="paid">Paid</TabsTrigger>
                    <TabsTrigger value="overdue">Overdue</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value={selectedTab} className="mt-6">
                    <div className="space-y-4">
                      {filteredFees.map((fee) => (
                        <div key={fee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                {getStatusIcon(fee.status)}
                              </div>
                              <div>
                                <h3 className="font-semibold">{fee.studentName}</h3>
                                <p className="text-sm text-gray-600">{fee.rollNumber} • {fee.department}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(fee.status)}>
                                {fee.status.toUpperCase()}
                              </Badge>
                              <p className="text-sm text-gray-600 mt-1">{fee.semester}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                            <div className="p-3 bg-blue-50 rounded">
                              <p className="font-medium text-blue-900">Total Fees</p>
                              <p className="text-lg font-bold text-blue-700">₹{fee.totalFees.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-green-50 rounded">
                              <p className="font-medium text-green-900">Paid Amount</p>
                              <p className="text-lg font-bold text-green-700">₹{fee.paidAmount.toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-red-50 rounded">
                              <p className="font-medium text-red-900">Due Amount</p>
                              <p className="text-lg font-bold text-red-700">₹{fee.dueAmount.toLocaleString()}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm">
                            <div>
                              <span className="font-medium">Due Date:</span> {new Date(fee.dueDate).toLocaleDateString()}
                              {fee.lastPayment && (
                                <span className="ml-4">
                                  <span className="font-medium">Last Payment:</span> {new Date(fee.lastPayment).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <Button size="sm" variant="outline">
                                <Receipt className="h-4 w-4 mr-1" />
                                Receipt
                              </Button>
                              {fee.dueAmount > 0 && (
                                <Button size="sm">
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Collect Fee
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {filteredFees.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No fee records found matching your criteria.
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{transaction.student}</p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.type}</p>
                      <p className="font-bold text-green-600">₹{transaction.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {transaction.method} • {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Collections</span>
                    <span className="font-semibold">₹1,25,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transactions</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="font-semibold text-orange-600">₹45,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
