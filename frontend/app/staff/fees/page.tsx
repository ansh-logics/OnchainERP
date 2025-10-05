"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { 
  CreditCard, 
  Search,
  Download,
  Filter,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface StudentFee {
  studentId: string;
  enrollmentNumber: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  section: string;
  currentSemester: number;
  feeSummary: {
    totalFees: number;
    paidAmount: number;
    remainingAmount: number;
    feeStatus: 'Paid' | 'Partial' | 'Unpaid';
  };
}

export default function FacultyFeesPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentFees, setStudentFees] = useState<StudentFee[]>([]);
  const [filteredFees, setFilteredFees] = useState<StudentFee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'staff' && currentUser.role !== 'faculty') {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }
    setUser(currentUser);
    fetchStudentFees();
  }, [router]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = studentFees.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredFees(filtered);
    } else {
      setFilteredFees(studentFees);
    }
  }, [searchTerm, studentFees]);

  const fetchStudentFees = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/faculty/fees');
      
      if (response.data.success) {
        setStudentFees(response.data.data);
        setFilteredFees(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching student fees:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>;
      case 'Partial':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          Partial
        </Badge>;
      case 'Unpaid':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Unpaid
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="Student Fee Status" userRole={(user?.role === 'faculty' ? 'faculty' : 'staff') as 'faculty'}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading student fee data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalStudents = filteredFees.length;
  const paidCount = filteredFees.filter(s => s.feeSummary.feeStatus === 'Paid').length;
  const partialCount = filteredFees.filter(s => s.feeSummary.feeStatus === 'Partial').length;
  const unpaidCount = filteredFees.filter(s => s.feeSummary.feeStatus === 'Unpaid').length;

  return (
    <DashboardLayout title="Student Fee Status" userRole={(user.role === 'faculty' ? 'faculty' : 'staff') as 'faculty'}>
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">In your courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidCount}</div>
              <p className="text-xs text-muted-foreground">{totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0}% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Partial</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
              <p className="text-xs text-muted-foreground">{totalStudents > 0 ? Math.round((partialCount / totalStudents) * 100) : 0}% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
              <p className="text-xs text-muted-foreground">{totalStudents > 0 ? Math.round((unpaidCount / totalStudents) * 100) : 0}% of total</p>
            </CardContent>
          </Card>
        </div>

        {/* Student Fee Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Fee Status</CardTitle>
                <CardDescription>View fee status of students in your courses (Read-only)</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, enrollment number, or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Enrollment No</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Total Fees</TableHead>
                    <TableHead className="text-right">Paid Amount</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.length > 0 ? (
                    filteredFees.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.enrollmentNumber}</TableCell>
                        <TableCell>{student.department}</TableCell>
                        <TableCell>{student.currentSemester}</TableCell>
                        <TableCell className="text-right">₹{student.feeSummary.totalFees.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600">₹{student.feeSummary.paidAmount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600">₹{student.feeSummary.remainingAmount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(student.feeSummary.feeStatus)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        {searchTerm ? 'No students found matching your search' : 'No student fee data available'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
