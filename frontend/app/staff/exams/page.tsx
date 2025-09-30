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
import { 
  Search,
  FileText, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Eye,
  Filter,
  Download,
  Plus,
  Edit,
  Users,
  Award,
  BookOpen
} from "lucide-react";

export default function StaffExamsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("schedule");
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

  // Mock exam data
  const examSchedule = [
    {
      id: '1',
      subject: 'Data Structures',
      course: 'B.Tech Computer Science',
      semester: '4th Semester',
      examType: 'Mid-term',
      date: '2024-04-15',
      time: '10:00 AM - 01:00 PM',
      duration: '3 hours',
      room: 'Room 201, Block A',
      supervisor: 'Dr. Rajesh Kumar',
      totalStudents: 45,
      status: 'scheduled'
    },
    {
      id: '2',
      subject: 'Database Management Systems',
      course: 'B.Tech Computer Science',
      semester: '5th Semester',
      examType: 'Final',
      date: '2024-04-18',
      time: '02:00 PM - 05:00 PM',
      duration: '3 hours',
      room: 'Room 105, Block B',
      supervisor: 'Prof. Priya Sharma',
      totalStudents: 38,
      status: 'scheduled'
    },
    {
      id: '3',
      subject: 'Digital Electronics',
      course: 'B.Tech Electronics',
      semester: '3rd Semester',
      examType: 'Mid-term',
      date: '2024-04-12',
      time: '10:00 AM - 01:00 PM',
      duration: '3 hours',
      room: 'Room 301, Block C',
      supervisor: 'Dr. Amit Patel',
      totalStudents: 42,
      status: 'completed'
    }
  ];

  // Mock student results
  const examResults = [
    {
      id: '1',
      examId: '3',
      studentName: 'Priya Sharma',
      rollNumber: 'CS21B001',
      subject: 'Digital Electronics',
      maxMarks: 100,
      obtainedMarks: 85,
      grade: 'A',
      status: 'graded',
      remarks: 'Excellent performance'
    },
    {
      id: '2',
      examId: '3',
      studentName: 'Rahul Kumar',
      rollNumber: 'ME21B045',
      subject: 'Digital Electronics',
      maxMarks: 100,
      obtainedMarks: 72,
      grade: 'B+',
      status: 'graded',
      remarks: 'Good understanding'
    },
    {
      id: '3',
      examId: '3',
      studentName: 'Sneha Reddy',
      rollNumber: 'EC21B023',
      subject: 'Digital Electronics',
      maxMarks: 100,
      obtainedMarks: 0,
      grade: 'F',
      status: 'absent',
      remarks: 'Medical leave'
    }
  ];

  // Mock exam halls
  const examHalls = [
    {
      id: '1',
      name: 'Room 201, Block A',
      capacity: 50,
      facilities: ['Air Conditioned', 'CCTV', 'Individual Desks'],
      status: 'available'
    },
    {
      id: '2',
      name: 'Room 105, Block B',
      capacity: 40,
      facilities: ['Air Conditioned', 'CCTV', 'Projector'],
      status: 'occupied'
    },
    {
      id: '3',
      name: 'Auditorium',
      capacity: 200,
      facilities: ['Air Conditioned', 'CCTV', 'Audio System', 'Stage'],
      status: 'available'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-gray-100 text-gray-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />;
      case 'graded': return <Award className="h-4 w-4" />;
      case 'absent': return <Users className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
      case 'A+': return 'text-green-600';
      case 'B':
      case 'B+': return 'text-blue-600';
      case 'C':
      case 'C+': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const filteredExams = examSchedule.filter(exam => 
    exam.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredResults = examResults.filter(result => 
    result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const examStats = {
    totalExams: examSchedule.length,
    scheduled: examSchedule.filter(exam => exam.status === 'scheduled').length,
    completed: examSchedule.filter(exam => exam.status === 'completed').length,
    totalStudents: examSchedule.reduce((sum, exam) => sum + exam.totalStudents, 0),
    avgAttendance: 92,
    passRate: 85
  };

  return (
    <DashboardLayout title="Exam Management" userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Exam Management</h2>
            <p className="text-gray-600">Manage exam schedules, conduct exams, and maintain results</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Exam
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{examStats.scheduled}</div>
                  <p className="text-sm text-gray-600">Scheduled Exams</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{examStats.completed}</div>
                  <p className="text-sm text-gray-600">Completed Exams</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-xl font-bold">{examStats.totalStudents}</div>
                  <p className="text-sm text-gray-600">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-xl font-bold text-green-600">{examStats.passRate}%</div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search exams, subjects, or students..."
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

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
            <TabsTrigger value="results">Results Management</TabsTrigger>
            <TabsTrigger value="halls">Exam Halls</TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Exams</CardTitle>
                <CardDescription>View and manage exam schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredExams.map((exam) => (
                    <div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getStatusIcon(exam.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{exam.subject}</h3>
                            <p className="text-sm text-gray-600">{exam.course} • {exam.semester}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="font-medium text-blue-900">Date & Time</p>
                          <p className="text-blue-700">{new Date(exam.date).toLocaleDateString()}</p>
                          <p className="text-blue-600">{exam.time}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded">
                          <p className="font-medium text-purple-900">Duration</p>
                          <p className="text-purple-700">{exam.duration}</p>
                          <p className="text-purple-600">{exam.examType}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <p className="font-medium text-green-900">Venue</p>
                          <p className="text-green-700">{exam.room}</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded">
                          <p className="font-medium text-orange-900">Students</p>
                          <p className="text-orange-700">{exam.totalStudents} enrolled</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">Supervisor:</span> {exam.supervisor}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {exam.status === 'scheduled' && (
                            <Button size="sm">
                              <FileText className="h-4 w-4 mr-1" />
                              Start Exam
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Results</CardTitle>
                <CardDescription>Manage student exam results and grades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getStatusIcon(result.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{result.studentName}</h3>
                            <p className="text-sm text-gray-600">{result.rollNumber} • {result.subject}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="font-medium text-blue-900">Obtained Marks</p>
                          <p className="text-xl font-bold text-blue-700">{result.obtainedMarks}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                          <p className="font-medium text-gray-900">Maximum Marks</p>
                          <p className="text-xl font-bold text-gray-700">{result.maxMarks}</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded">
                          <p className="font-medium text-yellow-900">Percentage</p>
                          <p className="text-xl font-bold text-yellow-700">{((result.obtainedMarks / result.maxMarks) * 100).toFixed(1)}%</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                          <p className="font-medium text-green-900">Grade</p>
                          <p className={`text-xl font-bold ${getGradeColor(result.grade)}`}>{result.grade}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div>
                          <span className="font-medium">Remarks:</span> {result.remarks}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View Answer Sheet
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Marks
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="halls" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Halls</CardTitle>
                <CardDescription>Manage exam venues and their availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {examHalls.map((hall) => (
                    <div key={hall.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{hall.name}</h3>
                            <p className="text-sm text-gray-600">Capacity: {hall.capacity} students</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(hall.status)}>
                          {hall.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <p className="font-medium text-sm mb-2">Facilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {hall.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View Schedule
                        </Button>
                        {hall.status === 'available' && (
                          <Button size="sm" className="flex-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            Book Hall
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
