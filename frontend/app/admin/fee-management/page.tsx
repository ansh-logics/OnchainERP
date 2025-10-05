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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  CreditCard,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Send,
  RefreshCw
} from "lucide-react";

interface FeeStructure {
  id: string;
  program: string;
  year: string;
  semester: string;
  totalFee: number;
  dueDate: string;
  status: 'active' | 'draft' | 'archived';
}

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
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  transactionId?: string;
}

export default function FeeManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSemester, setSelectedSemester] = useState("all");
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

  // Mock data for fee structures
  const feeStructures: FeeStructure[] = [
    {
      id: "1",
      program: "B.Tech Computer Science",
      year: "First Year",
      semester: "Odd Semester",
      totalFee: 140000,
      dueDate: "2024-07-31",
      status: "active"
    },
    {
      id: "2",
      program: "B.Tech Computer Science",
      year: "Second Year", 
      semester: "Odd Semester",
      totalFee: 148000,
      dueDate: "2024-07-31",
      status: "active"
    },
    {
      id: "3",
      program: "MBA",
      year: "First Year",
      semester: "Odd Semester",
      totalFee: 180000,
      dueDate: "2024-07-31",
      status: "draft"
    }
  ];

  // Mock data for fee transactions
  const feeTransactions: FeeTransaction[] = [
    {
      id: "1",
      studentId: "YU2024001",
      studentName: "Arjun Sharma",
      rollNumber: "21CS001",
      course: "B.Tech CS",
      semester: "Semester 6",
      feeType: "Semester Fee",
      amount: 75000,
      dueDate: "2024-07-15",
      paidDate: "2024-07-10",
      status: "paid",
      paymentMethod: "Online Banking",
      transactionId: "TXN789123456"
    },
    {
      id: "2",
      studentId: "YU2024002",
      studentName: "Priya Patel",
      rollNumber: "21CS002",
      course: "B.Tech CS",
      semester: "Semester 6",
      feeType: "Semester Fee",
      amount: 75000,
      dueDate: "2024-07-15",
      status: "pending",
    },
    {
      id: "3",
      studentId: "YU2024003",
      studentName: "Rahul Singh",
      rollNumber: "21ME001",
      course: "B.Tech ME",
      semester: "Semester 4",
      feeType: "Lab Fee",
      amount: 15000,
      dueDate: "2024-06-30",
      status: "overdue",
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'pending': return Clock;
      case 'overdue': return AlertCircle;
      case 'partial': return RefreshCw;
      case 'active': return CheckCircle;
      case 'draft': return Clock;
      case 'archived': return XCircle;
      default: return Clock;
    }
  };

  return (
    <DashboardLayout title="Fee Management" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fee Management</h2>
            <p className="text-muted-foreground">Comprehensive fee structure and payment management</p>
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
              Add New
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Collections</p>
                  <p className="text-lg font-bold">₹45.6L</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-lg font-bold">₹12.3L</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-lg font-bold">₹3.2L</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-lg font-bold">1,250</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                  <p className="text-lg font-bold">78.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-lg font-bold">₹8.9L</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>Latest fee payments received</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feeTransactions.filter(t => t.status === 'paid').slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.studentName}</p>
                          <p className="text-sm text-gray-600">{transaction.feeType} - {transaction.course}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">₹{transaction.amount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">{transaction.paidDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pending Payments */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Payments</CardTitle>
                  <CardDescription>Payments awaiting collection</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feeTransactions.filter(t => t.status === 'pending' || t.status === 'overdue').slice(0, 5).map((transaction) => {
                      const StatusIcon = getStatusIcon(transaction.status);
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{transaction.studentName}</p>
                            <p className="text-sm text-gray-600">{transaction.feeType} - {transaction.course}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">₹{transaction.amount.toLocaleString()}</p>
                            <Badge className={getStatusColor(transaction.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common fee management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col">
                    <Plus className="h-6 w-6 mb-2" />
                    Add Fee Structure
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <CreditCard className="h-6 w-6 mb-2" />
                    Manual Payment
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Send className="h-6 w-6 mb-2" />
                    Send Reminders
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    Export Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structures" className="space-y-6">
            {/* Fee Structures */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Fee Structures</CardTitle>
                    <CardDescription>Manage academic fee structures</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Structure
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeStructures.map((structure) => {
                    const StatusIcon = getStatusIcon(structure.status);
                    return (
                      <div key={structure.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{structure.program}</h3>
                            <p className="text-sm text-gray-600">{structure.year} - {structure.semester}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(structure.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {structure.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold">₹{structure.totalFee.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">Due: {new Date(structure.dueDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by student name, roll number, or transaction ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                      <SelectItem value="3">Semester 3</SelectItem>
                      <SelectItem value="4">Semester 4</SelectItem>
                      <SelectItem value="5">Semester 5</SelectItem>
                      <SelectItem value="6">Semester 6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Payments</CardTitle>
                <CardDescription>Track and manage all fee payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Fee Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feeTransactions.map((transaction) => {
                      const StatusIcon = getStatusIcon(transaction.status);
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{transaction.studentName}</p>
                              <p className="text-sm text-gray-500">{transaction.rollNumber}</p>
                            </div>
                          </TableCell>
                          <TableCell>{transaction.course}</TableCell>
                          <TableCell>{transaction.feeType}</TableCell>
                          <TableCell className="font-medium">₹{transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(transaction.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(transaction.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Reports</CardTitle>
                <CardDescription>Generate and download fee management reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mb-3" />
                    <h3 className="font-semibold mb-2">Collection Report</h3>
                    <p className="text-sm text-gray-600 mb-4">Detailed fee collection statistics</p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
                    <h3 className="font-semibold mb-2">Outstanding Fees</h3>
                    <p className="text-sm text-gray-600 mb-4">Pending and overdue payments</p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Calendar className="h-8 w-8 text-purple-600 mb-3" />
                    <h3 className="font-semibold mb-2">Monthly Summary</h3>
                    <p className="text-sm text-gray-600 mb-4">Month-wise collection summary</p>
                    <Button variant="outline" size="sm">Generate Report</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Management Settings</CardTitle>
                <CardDescription>Configure fee collection and payment settings</CardDescription>
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
                    <h4 className="font-semibold">Notification Settings</h4>
                    <div className="space-y-2">
                      <Label>Reminder Days Before Due Date</Label>
                      <Input type="number" defaultValue="7" />
                    </div>
                    <div className="space-y-2">
                      <Label>Overdue Reminder Frequency (days)</Label>
                      <Input type="number" defaultValue="3" />
                    </div>
                    <div className="space-y-2">
                      <Label>Email Template</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard Reminder</SelectItem>
                          <SelectItem value="urgent">Urgent Notice</SelectItem>
                          <SelectItem value="final">Final Notice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
