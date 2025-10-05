"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { getCurrentUser } from "@/lib/auth";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck,
  Save,
  RefreshCw,
  Users,
  CalendarDays,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Search,
  Filter,
  Download,
  BarChart3
} from "lucide-react";

interface Student {
  id: string;
  rollNumber: string;
  name: string;
  attendancePercentage: number;
  totalClasses: number;
  attendedClasses: number;
  status: string;
}

interface Section {
  id: string;
  courseCode: string;
  courseName: string;
  sectionName: string;
  semester: number;
  studentsCount: number;
  averageAttendance: number;
  lastAttendanceDate: string;
  students: Student[];
}

interface AttendanceData {
  sections: Section[];
  attendanceStats: {
    totalSections: number;
    totalStudents: number;
    overallAttendance: number;
    excellentAttendance: number;
    regularAttendance: number;
    poorAttendance: number;
    averageClassesPerWeek: number;
    attendanceMarkedToday: number;
    pendingAttendance: number;
  };
}

interface AttendanceRecord {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export default function FacultyAttendancePage() {
  const [user, setUser] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    if (currentUser.role !== 'faculty') {
      router.push('/');
      return;
    }

    setUser(currentUser);
    fetchAttendanceData();
  }, [router]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/faculty/attendance', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAttendanceData(data.data);
        if (data.data.sections.length > 0 && !selectedSection) {
          setSelectedSection(data.data.sections[0].id);
          initializeAttendanceRecords(data.data.sections[0].students);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch attendance data');
      }
    } catch (err: any) {
      console.error('Attendance fetch error:', err);
      setError(err.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const initializeAttendanceRecords = (students: Student[]) => {
    const records = students.map(student => ({
      studentId: student.id,
      status: 'present' as const,
      remarks: ''
    }));
    setAttendanceRecords(records);
  };

  const handleSectionChange = (sectionId: string) => {
    setSelectedSection(sectionId);
    const section = attendanceData?.sections.find(s => s.id === sectionId);
    if (section) {
      initializeAttendanceRecords(section.students);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => 
      prev.map(record => 
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const handleBulkAttendance = (status: 'present' | 'absent') => {
    const filteredStudents = getFilteredStudents();
    setAttendanceRecords(prev => 
      prev.map(record => {
        const student = filteredStudents.find(s => s.id === record.studentId);
        return student ? { ...record, status } : record;
      })
    );
  };

  const saveAttendance = async () => {
    if (!selectedSection) {
      setError('Please select a section');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/faculty/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sectionId: selectedSection,
          date: selectedDate,
          attendanceData: attendanceRecords,
          courseCode: currentSection?.courseCode
        })
      });

      const data = await response.json();

      if (data.success) {
        // Show success message or notification
        alert('Attendance marked successfully!');
        // Optionally refresh data
        fetchAttendanceData();
      } else {
        throw new Error(data.message || 'Failed to save attendance');
      }
    } catch (err: any) {
      console.error('Save attendance error:', err);
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200';
      case 'regular': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'irregular': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getFilteredStudents = () => {
    if (!currentSection) return [];
    
    return currentSection.students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const currentSection = attendanceData?.sections.find(s => s.id === selectedSection);
  const filteredStudents = getFilteredStudents();

  if (loading || !user) {
    return (
      <DashboardLayout title="Attendance Management" userRole="faculty">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Attendance Management" userRole="faculty">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchAttendanceData}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!attendanceData) {
    return (
      <DashboardLayout title="Attendance Management" userRole="faculty">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No attendance data available</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { attendanceStats } = attendanceData;

  return (
    <DashboardLayout title="Attendance Management" userRole="faculty">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">{attendanceStats.totalSections} sections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Attendance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attendanceStats.overallAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Average across all sections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excellent Attendance</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendanceStats.excellentAttendance}</div>
              <p className="text-xs text-muted-foreground">Students with &gt;90% attendance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Poor Attendance</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{attendanceStats.poorAttendance}</div>
              <p className="text-xs text-muted-foreground">Students with &lt;75% attendance</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="mark-attendance" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
            <TabsTrigger value="view-reports">View Reports</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="mark-attendance" className="space-y-6">
            {/* Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Mark Attendance</CardTitle>
                <CardDescription>Select section and date to mark student attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Select value={selectedSection} onValueChange={handleSectionChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select section" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceData.sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.courseCode} - {section.sectionName} ({section.studentsCount} students)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Actions</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAttendance('present')}
                        className="text-green-600"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Mark All Present
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkAttendance('absent')}
                        className="text-red-600"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Mark All Absent
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Students</SelectItem>
                      <SelectItem value="excellent">Excellent (&gt;90%)</SelectItem>
                      <SelectItem value="regular">Regular (75-90%)</SelectItem>
                      <SelectItem value="irregular">Irregular (&lt;75%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Table */}
            {currentSection && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {currentSection.courseCode} - {currentSection.courseName}
                      </CardTitle>
                      <CardDescription>
                        Section {currentSection.sectionName} • {filteredStudents.length} students
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={saveAttendance}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Attendance
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Roll Number</TableHead>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Current Attendance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Mark Attendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => {
                        const record = attendanceRecords.find(r => r.studentId === student.id);
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className={getAttendanceColor(student.attendancePercentage)}>
                                  {student.attendancePercentage.toFixed(1)}%
                                </span>
                                <span className="text-muted-foreground text-sm">
                                  ({student.attendedClasses}/{student.totalClasses})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(student.status)}>
                                {student.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`present-${student.id}`}
                                    checked={record?.status === 'present'}
                                    onCheckedChange={() => handleAttendanceChange(student.id, 'present')}
                                  />
                                  <Label htmlFor={`present-${student.id}`} className="text-green-600">
                                    Present
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`absent-${student.id}`}
                                    checked={record?.status === 'absent'}
                                    onCheckedChange={() => handleAttendanceChange(student.id, 'absent')}
                                  />
                                  <Label htmlFor={`absent-${student.id}`} className="text-red-600">
                                    Absent
                                  </Label>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="view-reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Reports</CardTitle>
                <CardDescription>View detailed attendance reports for all sections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {attendanceData.sections.map((section) => (
                    <Card key={section.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{section.courseCode} - {section.courseName}</h4>
                            <p className="text-sm text-muted-foreground">
                              Section {section.sectionName} • {section.studentsCount} students
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-2xl font-bold ${getAttendanceColor(section.averageAttendance)}`}>
                              {section.averageAttendance.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">Average Attendance</p>
                            <p className="text-xs text-muted-foreground">
                              Last marked: {section.lastAttendanceDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                          </Button>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
                <CardDescription>Detailed insights into attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-4">Attendance Distribution</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Excellent (&gt;90%)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(attendanceStats.excellentAttendance / attendanceStats.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{attendanceStats.excellentAttendance}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Regular (75-90%)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(attendanceStats.regularAttendance / attendanceStats.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{attendanceStats.regularAttendance}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Poor (&lt;75%)</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-600 h-2 rounded-full" 
                              style={{ width: `${(attendanceStats.poorAttendance / attendanceStats.totalStudents) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{attendanceStats.poorAttendance}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">Weekly Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm">Classes per week</span>
                        <span className="text-lg font-bold text-blue-600">
                          {attendanceStats.averageClassesPerWeek}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">Attendance marked today</span>
                        <span className="text-lg font-bold text-green-600">
                          {attendanceStats.attendanceMarkedToday}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">Pending attendance</span>
                        <span className="text-lg font-bold text-yellow-600">
                          {attendanceStats.pendingAttendance}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
