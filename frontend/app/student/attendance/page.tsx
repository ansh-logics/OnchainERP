'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  BookOpen,
  Calendar,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';
import { mockAttendanceData, AttendanceData, SubjectStats, AttendanceRecord, ApiResponse } from '@/lib/mock-data';
import { toast } from 'sonner';

// Types are imported from @/types/student

export default function StudentAttendancePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [subjectStats, setSubjectStats] = useState<SubjectStats[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      loadMockData();
    }
  }, []);

  const loadMockData = async () => {
    try {
      setLoading(true);
      
      // Simulate API loading delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAttendanceData(mockAttendanceData);
      setSubjectStats(mockAttendanceData.subjectWiseStats);
      
    } catch (error: any) {
      console.error('Error loading attendance data:', error);
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Present</Badge>;
      case 'absent':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Absent</Badge>;
      case 'late':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Late</Badge>;
      case 'excused':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Excused</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPercentageStatus = (percentage: number) => {
    if (percentage >= 75) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Good'
      };
    } else if (percentage >= 60) {
      return {
        icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        label: 'Warning'
      };
    } else {
      return {
        icon: <TrendingDown className="h-5 w-5 text-red-500" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Critical'
      };
    }
  };

  if (loading) {
    return (
      <DashboardLayout userRole={user?.role || 'student'} title="My Attendance">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!attendanceData) {
    return (
      <DashboardLayout userRole={user?.role || 'student'} title="My Attendance">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No attendance data available</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { student, overallStats, subjectWiseStats, attendanceRecords } = attendanceData;
  const overallStatus = getPercentageStatus(overallStats.overallPercentage);

  return (
    <DashboardLayout userRole={user?.role || 'student'} title="My Attendance">
      <div className="space-y-6">
        
        {/* Student Info & Overall Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{student.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="font-medium">{student.rollNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-medium">{student.section.name} - Semester {student.section.semester}</p>
              </div>
            </CardContent>
          </Card>

          <Card className={`${overallStatus.bgColor} ${overallStatus.borderColor} border-2`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Overall Attendance</span>
                {overallStatus.icon}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className={`text-5xl font-bold ${overallStatus.color}`}>
                  {overallStats.overallPercentage.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {overallStats.present} out of {overallStats.totalClasses} classes
                </p>
              </div>
              <Progress 
                value={overallStats.overallPercentage} 
                className="h-3"
              />
              <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
                <div>
                  <p className="text-2xl font-bold text-green-600">{overallStats.present}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">{overallStats.absent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">{overallStats.late}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{overallStats.excused}</p>
                  <p className="text-xs text-muted-foreground">Excused</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Attendance */}
        <Card>
          <CardHeader>
            <CardTitle>Subject-wise Attendance</CardTitle>
            <CardDescription>Your attendance percentage for each subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectStats.map((subject) => {
                const status = getPercentageStatus(subject.percentage);
                return (
                  <Card key={subject.courseId} className={`${status.bgColor} ${status.borderColor} border`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{subject.courseCode}</h3>
                          <p className="text-sm text-muted-foreground">{subject.courseName}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {status.icon}
                          <div className="text-right">
                            <p className={`text-3xl font-bold ${status.color}`}>
                              {subject.percentage.toFixed(1)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {subject.present}/{subject.totalClasses} classes
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Progress 
                        value={subject.percentage} 
                        className="h-2 mb-3"
                      />
                      
                      <div className="grid grid-cols-4 gap-2 text-center text-sm">
                        <div>
                          <p className="font-bold text-green-600">{subject.present}</p>
                          <p className="text-xs text-muted-foreground">Present</p>
                        </div>
                        <div>
                          <p className="font-bold text-red-600">{subject.absent}</p>
                          <p className="text-xs text-muted-foreground">Absent</p>
                        </div>
                        <div>
                          <p className="font-bold text-orange-600">{subject.late}</p>
                          <p className="text-xs text-muted-foreground">Late</p>
                        </div>
                        <div>
                          <p className="font-bold text-blue-600">{subject.excused}</p>
                          <p className="text-xs text-muted-foreground">Excused</p>
                        </div>
                      </div>

                      {subject.percentage < 75 && (
                        <div className="mt-3 p-3 bg-white border rounded-md">
                          <p className="text-sm font-medium text-orange-700">
                            ⚠️ You need {Math.ceil((0.75 * subject.totalClasses) - subject.present)} more classes to reach 75%
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Detailed period-wise attendance records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {new Date(record.attendanceDate).toLocaleDateString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">P{record.period}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.course.code}</p>
                          <p className="text-sm text-muted-foreground">{record.course.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm truncate">{record.topic || '-'}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.classType}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(record.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {attendanceRecords.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No attendance records found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Attendance Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>• <strong>Minimum Required:</strong> 75% attendance is mandatory for appearing in exams</p>
            <p>• <strong>Good Standing:</strong> ≥75% attendance (No issues)</p>
            <p>• <strong>Warning:</strong> 60-75% attendance (Need to improve)</p>
            <p>• <strong>Critical:</strong> &lt;60% attendance (Immediate attention required)</p>
            <p>• <strong>Note:</strong> Attendance is calculated period-wise for each subject separately</p>
          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  );
}

