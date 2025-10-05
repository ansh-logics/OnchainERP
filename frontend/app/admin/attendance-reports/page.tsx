'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Filter,
  Users,
  BarChart3,
  FileText
} from 'lucide-react';
import { api } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface Section {
  id: string;
  name: string;
  code: string;
}

interface Course {
  id: string;
  code: string;
  name: string;
}

interface StudentStat {
  studentId: string;
  rollNumber: string;
  enrollmentNumber: string;
  name: string;
  email: string;
  section: string;
  sectionCode: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
  subjectWise: SubjectWiseAttendance[];
}

interface SubjectWiseAttendance {
  courseCode: string;
  courseName: string;
  present: number;
  total: number;
  percentage: number;
}

interface OverallStats {
  totalStudents: number;
  studentsAbove75: number;
  students60to75: number;
  studentsBelow60: number;
  averageAttendance: number;
}

interface PeriodStat {
  date: string;
  period: number;
  courseCode: string;
  courseName: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

export default function AdminAttendanceReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minPercentage, setMinPercentage] = useState('');
  const [maxPercentage, setMaxPercentage] = useState('');

  // Report data
  const [overallStats, setOverallStats] = useState<OverallStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStat[]>([]);
  const [periodStats, setPeriodStats] = useState<PeriodStat[]>([]);
  
  // Department-level data
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [departmentOverallStats, setDepartmentOverallStats] = useState<any>(null);
  const [selectedDepartmentForDrillDown, setSelectedDepartmentForDrillDown] = useState<string | null>(null);
  const [departmentDetailData, setDepartmentDetailData] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      fetchSections();
      fetchCourses();
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/departments');
      if (response.data.success) {
        setDepartments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const response = await api.get(`/api/sections?departmentId=${selectedDepartment}`);
      if (response.data.success) {
        setSections(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get(`/api/courses?departmentId=${selectedDepartment}`);
      if (response.data.success) {
        setCourses(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchComprehensiveReport = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('departmentId', selectedDepartment);
      if (selectedSection) params.append('sectionId', selectedSection);
      if (selectedCourse) params.append('courseId', selectedCourse);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (minPercentage) params.append('minPercentage', minPercentage);
      if (maxPercentage) params.append('maxPercentage', maxPercentage);

      const response = await api.get(`/api/faculty/attendance/admin/comprehensive-report?${params.toString()}`);
      
      if (response.data.success) {
        setOverallStats(response.data.data.overallStats);
        setStudentStats(response.data.data.studentStats);
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      alert(error.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriodStats = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedSection) params.append('sectionId', selectedSection);
      if (selectedCourse) params.append('courseId', selectedCourse);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/api/faculty/attendance/admin/period-stats?${params.toString()}`);
      
      if (response.data.success) {
        setPeriodStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching period stats:', error);
      alert(error.response?.data?.message || 'Failed to fetch period statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentStats = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (selectedDepartment) params.append('departmentId', selectedDepartment);
      if (selectedCourse) params.append('courseId', selectedCourse);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(`/api/faculty/attendance/admin/department-stats?${params.toString()}`);
      
      if (response.data.success) {
        setDepartmentStats(response.data.data.departments);
        setDepartmentOverallStats(response.data.data.overallStats);
      }
    } catch (error: any) {
      console.error('Error fetching department stats:', error);
      alert(error.response?.data?.message || 'Failed to fetch department statistics');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentDetail = async (departmentId: string) => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await api.get(
        `/api/faculty/attendance/admin/department-detail/${departmentId}?${params.toString()}`
      );
      
      if (response.data.success) {
        setDepartmentDetailData(response.data.data);
        setSelectedDepartmentForDrillDown(departmentId);
      }
    } catch (error: any) {
      console.error('Error fetching department detail:', error);
      alert(error.response?.data?.message || 'Failed to fetch department details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, percentage: number) => {
    if (status === 'good' || percentage >= 75) {
      return <Badge className="bg-green-100 text-green-800">Good</Badge>;
    } else if (status === 'warning' || percentage >= 60) {
      return <Badge className="bg-orange-100 text-orange-800">Warning</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    }
  };

  const exportToCSV = () => {
    if (studentStats.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = ['Roll No', 'Name', 'Section', 'Total Classes', 'Present', 'Absent', 'Late', 'Excused', 'Percentage', 'Status'];
    const rows = studentStats.map(s => [
      s.rollNumber,
      s.name,
      s.section,
      s.totalClasses,
      s.present,
      s.absent,
      s.late,
      s.excused,
      s.percentage.toFixed(2),
      s.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout userRole={user?.role || 'admin'} title="Attendance Reports">
      <div className="space-y-6">
        
        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Report Filters</CardTitle>
                <CardDescription>Select filters to generate comprehensive attendance reports</CardDescription>
              </div>
              <Button onClick={fetchComprehensiveReport} disabled={loading}>
                <Filter className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Generate Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Department</Label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Section</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Sections</SelectItem>
                    {sections.map(section => (
                      <SelectItem key={section.id} value={section.id}>{section.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Course</Label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!selectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Course" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Courses</SelectItem>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id}>{course.code} - {course.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>

              <div>
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              <div>
                <Label>Min Percentage</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 60" 
                  value={minPercentage} 
                  onChange={(e) => setMinPercentage(e.target.value)} 
                />
              </div>

              <div>
                <Label>Max Percentage</Label>
                <Input 
                  type="number" 
                  placeholder="e.g., 100" 
                  value={maxPercentage} 
                  onChange={(e) => setMaxPercentage(e.target.value)} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="department-level" className="space-y-6">
          <TabsList>
            <TabsTrigger value="department-level" onClick={fetchDepartmentStats}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Department-Level
            </TabsTrigger>
            <TabsTrigger value="student-wise">
              <Users className="h-4 w-4 mr-2" />
              Student-wise Report
            </TabsTrigger>
            <TabsTrigger value="period-wise" onClick={fetchPeriodStats}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Period-wise Stats
            </TabsTrigger>
          </TabsList>

          {/* Department-Level Report */}
          <TabsContent value="department-level" className="space-y-6">
            {/* Overall Department Statistics */}
            {departmentOverallStats && (
              <div className="grid gap-4 md:grid-cols-5">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-3xl font-bold">{departmentOverallStats.totalDepartments}</p>
                      <p className="text-sm text-muted-foreground">Departments</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <p className="text-3xl font-bold">{departmentOverallStats.totalStudents}</p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-3xl font-bold text-green-600">{departmentOverallStats.departmentsAbove75}</p>
                      <p className="text-sm text-muted-foreground">Above 75%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-3xl font-bold text-orange-600">{departmentOverallStats.departments60to75}</p>
                      <p className="text-sm text-muted-foreground">60-75%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <p className="text-3xl font-bold text-red-600">{departmentOverallStats.departmentsBelow60}</p>
                      <p className="text-sm text-muted-foreground">Below 60%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Department Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Department-wise Attendance</CardTitle>
                <CardDescription>Click on a department to view detailed breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departmentStats.map((dept) => (
                    <Card
                      key={dept.departmentId}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        dept.percentage >= 75 ? 'border-green-300 bg-green-50' :
                        dept.percentage >= 60 ? 'border-orange-300 bg-orange-50' :
                        'border-red-300 bg-red-50'
                      }`}
                      onClick={() => fetchDepartmentDetail(dept.departmentId)}
                    >
                      <CardContent className="pt-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-lg">{dept.departmentCode}</h3>
                            {getStatusBadge(dept.status, dept.percentage)}
                          </div>
                          <p className="text-sm text-muted-foreground">{dept.departmentName}</p>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Attendance:</span>
                              <span className="font-bold text-lg">{dept.percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  dept.percentage >= 75 ? 'bg-green-500' :
                                  dept.percentage >= 60 ? 'bg-orange-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${dept.percentage}%` }}
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t">
                            <div>
                              <p className="text-muted-foreground">Students</p>
                              <p className="font-semibold">{dept.totalStudents}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Sections</p>
                              <p className="font-semibold">{dept.totalSections}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Present</p>
                              <p className="font-semibold text-green-600">{dept.present}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Absent</p>
                              <p className="font-semibold text-red-600">{dept.absent}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {departmentStats.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No department data available. Please apply filters and generate report.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Department Detail Drill-Down */}
            {departmentDetailData && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        {departmentDetailData.department.name} - Detailed Breakdown
                      </CardTitle>
                      <CardDescription>
                        Section and student-level attendance details
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setDepartmentDetailData(null);
                        setSelectedDepartmentForDrillDown(null);
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Department Summary */}
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Overall %</p>
                        <p className="text-2xl font-bold">{departmentDetailData.department.percentage.toFixed(1)}%</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Students</p>
                        <p className="text-2xl font-bold">{departmentDetailData.department.totalStudents}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Sections</p>
                        <p className="text-2xl font-bold">{departmentDetailData.department.totalSections}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <p className="text-sm text-muted-foreground">Total Periods</p>
                        <p className="text-2xl font-bold">{departmentDetailData.department.totalPeriods}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Section-wise Stats */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Section-wise Breakdown</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Section</TableHead>
                            <TableHead>Semester</TableHead>
                            <TableHead className="text-right">Students</TableHead>
                            <TableHead className="text-right">Present</TableHead>
                            <TableHead className="text-right">Absent</TableHead>
                            <TableHead className="text-right">%</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {departmentDetailData.sectionStats.map((section: any) => (
                            <TableRow key={section.sectionId}>
                              <TableCell className="font-medium">{section.sectionName}</TableCell>
                              <TableCell>Sem {section.semester}</TableCell>
                              <TableCell className="text-right">{section.studentCount}</TableCell>
                              <TableCell className="text-right text-green-600">{section.present}</TableCell>
                              <TableCell className="text-right text-red-600">{section.absent}</TableCell>
                              <TableCell className="text-right font-bold">{section.percentage.toFixed(1)}%</TableCell>
                              <TableCell>{getStatusBadge(section.status, section.percentage)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Low Attendance Students */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Students Needing Attention (&lt;75%)</h3>
                    <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Section</TableHead>
                            <TableHead className="text-right">Present</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">%</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {departmentDetailData.studentStats
                            .filter((s: any) => s.percentage < 75)
                            .map((student: any) => (
                              <TableRow key={student.studentId}>
                                <TableCell className="font-medium">{student.rollNumber}</TableCell>
                                <TableCell>{student.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{student.section}</Badge>
                                </TableCell>
                                <TableCell className="text-right text-green-600">{student.present}</TableCell>
                                <TableCell className="text-right">{student.totalPeriods}</TableCell>
                                <TableCell className="text-right font-bold">{student.percentage.toFixed(1)}%</TableCell>
                                <TableCell>{getStatusBadge(student.status, student.percentage)}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Student-wise Report */}
          <TabsContent value="student-wise" className="space-y-6">
            {/* Overall Statistics */}
            {overallStats && (
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-3xl font-bold">{overallStats.totalStudents}</p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-3xl font-bold text-green-600">{overallStats.studentsAbove75}</p>
                      <p className="text-sm text-muted-foreground">Above 75%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="text-3xl font-bold text-orange-600">{overallStats.students60to75}</p>
                      <p className="text-sm text-muted-foreground">60-75%</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                      <p className="text-3xl font-bold text-red-600">{overallStats.studentsBelow60}</p>
                      <p className="text-sm text-muted-foreground">Below 60%</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Student Statistics Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Student Attendance Report</CardTitle>
                    <CardDescription>Detailed attendance statistics for each student</CardDescription>
                  </div>
                  <Button onClick={exportToCSV} variant="outline" disabled={studentStats.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Section</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Present</TableHead>
                        <TableHead className="text-right">Absent</TableHead>
                        <TableHead className="text-right">%</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentStats.map((student) => (
                        <TableRow key={student.studentId}>
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{student.section}</Badge>
                          </TableCell>
                          <TableCell className="text-right">{student.totalClasses}</TableCell>
                          <TableCell className="text-right text-green-600 font-medium">{student.present}</TableCell>
                          <TableCell className="text-right text-red-600 font-medium">{student.absent}</TableCell>
                          <TableCell className="text-right font-bold">{student.percentage.toFixed(1)}%</TableCell>
                          <TableCell>{getStatusBadge(student.status, student.percentage)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {studentStats.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No data available. Please apply filters and generate report.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Period-wise Stats */}
          <TabsContent value="period-wise" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Period-wise Attendance Statistics</CardTitle>
                <CardDescription>Attendance data grouped by date and period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Present</TableHead>
                        <TableHead className="text-right">Absent</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {periodStats.map((stat, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {new Date(stat.date).toLocaleDateString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">P{stat.period}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{stat.courseCode}</p>
                              <p className="text-sm text-muted-foreground">{stat.courseName}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{stat.total}</TableCell>
                          <TableCell className="text-right text-green-600">{stat.present}</TableCell>
                          <TableCell className="text-right text-red-600">{stat.absent}</TableCell>
                          <TableCell className="text-right font-bold">{stat.percentage.toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {periodStats.length === 0 && !loading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No period-wise data available. Please apply filters and refresh.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </DashboardLayout>
  );
}

