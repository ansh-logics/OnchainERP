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
  Calendar,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  MapPin,
  BookOpen,
  GraduationCap,
  User,
  Plus,
  Edit,
  Trash2,
  Send,
  Settings,
  ClipboardCheck,
  Timer,
  Building,
  UserCheck,
  CalendarDays
} from "lucide-react";

interface ExamSchedule {
  id: string;
  examType: string;
  course: string;
  semester: string;
  subject: string;
  subjectCode: string;
  examDate: string;
  startTime: string;
  duration: number;
  venue: string;
  capacity: number;
  enrolled: number;
  invigilator1: string;
  invigilator2?: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'postponed';
  instructions?: string;
}

interface ExamVenue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  status: 'available' | 'occupied' | 'maintenance';
}

export default function ExamSchedulingPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedExamType, setSelectedExamType] = useState("all");
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

  const examSchedules: ExamSchedule[] = [
    {
      id: "1",
      examType: "Mid Semester",
      course: "B.Tech",
      semester: "Semester 6",
      subject: "Database Management Systems",
      subjectCode: "CS301",
      examDate: "2024-08-15",
      startTime: "09:00",
      duration: 180,
      venue: "Main Hall A",
      capacity: 120,
      enrolled: 85,
      invigilator1: "Dr. Rajesh Kumar",
      invigilator2: "Prof. Priya Sharma",
      status: "scheduled"
    },
    {
      id: "2",
      examType: "Mid Semester", 
      course: "B.Tech",
      semester: "Semester 6",
      subject: "Computer Networks",
      subjectCode: "CS302",
      examDate: "2024-08-16",
      startTime: "14:00",
      duration: 180,
      venue: "Main Hall B",
      capacity: 100,
      enrolled: 78,
      invigilator1: "Dr. Amit Singh",
      status: "confirmed"
    },
    {
      id: "3",
      examType: "Final Semester",
      course: "MBA",
      semester: "Semester 2",
      subject: "Financial Management",
      subjectCode: "MBA201",
      examDate: "2024-08-18",
      startTime: "09:00",
      duration: 180,
      venue: "Business Block Room 201",
      capacity: 60,
      enrolled: 45,
      invigilator1: "Prof. Sarah Williams",
      invigilator2: "Dr. Michael Brown",
      status: "scheduled",
      instructions: "Calculator allowed. No mobile phones."
    },
    {
      id: "4",
      examType: "Mid Semester",
      course: "B.Tech",
      semester: "Semester 4",
      subject: "Data Structures",
      subjectCode: "CS201",
      examDate: "2024-08-20",
      startTime: "09:00",
      duration: 180,
      venue: "Computer Lab 1",
      capacity: 40,
      enrolled: 35,
      invigilator1: "Dr. Neha Agarwal",
      status: "postponed"
    },
    {
      id: "5",
      examType: "Final Semester",
      course: "BBA",
      semester: "Semester 6",
      subject: "Marketing Management",
      subjectCode: "BBA301",
      examDate: "2024-07-25",
      startTime: "14:00",
      duration: 180,
      venue: "Main Hall C",
      capacity: 80,
      enrolled: 65,
      invigilator1: "Prof. Ravi Gupta",
      invigilator2: "Dr. Sunita Jain",
      status: "completed"
    }
  ];

  const venues: ExamVenue[] = [
    {
      id: "1",
      name: "Main Hall A",
      location: "Ground Floor, Academic Block",
      capacity: 120,
      facilities: ["AC", "CCTV", "Projector", "Sound System"],
      status: "available"
    },
    {
      id: "2",
      name: "Main Hall B", 
      location: "Ground Floor, Academic Block",
      capacity: 100,
      facilities: ["AC", "CCTV", "Projector"],
      status: "occupied"
    },
    {
      id: "3",
      name: "Computer Lab 1",
      location: "First Floor, IT Block",
      capacity: 40,
      facilities: ["AC", "CCTV", "Computers", "UPS"],
      status: "available"
    },
    {
      id: "4",
      name: "Business Block Room 201",
      location: "Second Floor, Business Block",
      capacity: 60,
      facilities: ["AC", "CCTV", "Whiteboard"],
      status: "available"
    }
  ];

  const courses = ["All Courses", "B.Tech", "MBA", "BBA", "BCA", "M.Tech"];
  const examTypes = ["All Types", "Mid Semester", "Final Semester", "Practical", "Viva", "Internal Assessment"];

  const filteredSchedules = examSchedules.filter(schedule =>
    (selectedCourse === "all" || selectedCourse === "All Courses" || schedule.course === selectedCourse) &&
    (selectedStatus === "all" || schedule.status === selectedStatus) &&
    (selectedExamType === "all" || selectedExamType === "All Types" || schedule.examType === selectedExamType) &&
    (schedule.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
     schedule.subjectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
     schedule.venue.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'postponed': return 'bg-yellow-100 text-yellow-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Calendar;
      case 'confirmed': return CheckCircle;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      case 'postponed': return Clock;
      case 'available': return CheckCircle;
      case 'occupied': return XCircle;
      case 'maintenance': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const examStats = {
    totalExams: examSchedules.length,
    scheduled: examSchedules.filter(e => e.status === 'scheduled').length,
    confirmed: examSchedules.filter(e => e.status === 'confirmed').length,
    completed: examSchedules.filter(e => e.status === 'completed').length,
    postponed: examSchedules.filter(e => e.status === 'postponed').length,
    totalStudents: examSchedules.reduce((sum, e) => sum + e.enrolled, 0),
    availableVenues: venues.filter(v => v.status === 'available').length
  };

  return (
    <DashboardLayout title="Exam Scheduling" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Exam Scheduling Management</h2>
            <p className="text-muted-foreground">Schedule and manage examination timetables</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Schedule
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Notify Students
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Exam
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{examStats.totalExams}</p>
                <p className="text-sm text-gray-600">Total Exams</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{examStats.scheduled}</p>
                <p className="text-sm text-gray-600">Scheduled</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{examStats.confirmed}</p>
                <p className="text-sm text-gray-600">Confirmed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">{examStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{examStats.postponed}</p>
                <p className="text-sm text-gray-600">Postponed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{examStats.totalStudents}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{examStats.availableVenues}</p>
                <p className="text-sm text-gray-600">Available Venues</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
            <TabsTrigger value="venues">Venues</TabsTrigger>
            <TabsTrigger value="invigilators">Invigilators</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search exams..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course} value={course === "All Courses" ? "all" : course}>
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type} value={type === "All Types" ? "all" : type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Exam Schedule List */}
            <div className="space-y-4">
              {filteredSchedules.map((exam) => {
                const StatusIcon = getStatusIcon(exam.status);
                
                return (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <FileText className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{exam.subject}</h3>
                            <p className="text-sm text-gray-600">Code: {exam.subjectCode} | {exam.course} - {exam.semester}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{exam.examType}</Badge>
                              <Badge variant="outline">{exam.course}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(exam.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {exam.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">{exam.examDate}</p>
                        </div>
                      </div>

                      {/* Exam Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{exam.examDate} at {exam.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Duration: {exam.duration} mins</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{exam.venue}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{exam.enrolled}/{exam.capacity} students</span>
                        </div>
                      </div>

                      {/* Capacity and Invigilators */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium mb-2">Capacity Utilization</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(exam.enrolled / exam.capacity) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{Math.round((exam.enrolled / exam.capacity) * 100)}% filled</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Invigilators</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-3 w-3 text-green-600" />
                              <span className="text-sm">{exam.invigilator1}</span>
                            </div>
                            {exam.invigilator2 && (
                              <div className="flex items-center gap-2">
                                <UserCheck className="h-3 w-3 text-green-600" />
                                <span className="text-sm">{exam.invigilator2}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      {exam.instructions && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium mb-1">Special Instructions:</p>
                          <p className="text-sm text-gray-700">{exam.instructions}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {exam.status === 'scheduled' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Confirm
                            </Button>
                            <Button variant="outline" size="sm">
                              <Clock className="h-4 w-4 mr-2" />
                              Reschedule
                            </Button>
                          </>
                        )}
                        {(exam.status === 'confirmed' || exam.status === 'scheduled') && (
                          <Button variant="outline" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Notify
                          </Button>
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

          <TabsContent value="venues" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venues.map((venue) => {
                const StatusIcon = getStatusIcon(venue.status);
                
                return (
                  <Card key={venue.id} className={`hover:shadow-lg transition-shadow border-l-4 ${
                    venue.status === 'available' ? 'border-l-green-500' :
                    venue.status === 'occupied' ? 'border-l-red-500' :
                    'border-l-yellow-500'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Building className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{venue.name}</h3>
                            <p className="text-sm text-gray-600">{venue.location}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(venue.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {venue.status}
                        </Badge>
                      </div>

                      {/* Capacity */}
                      <div className="text-center p-3 bg-gray-50 rounded-lg mb-4">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">Capacity</span>
                        </div>
                        <p className="text-2xl font-bold">{venue.capacity}</p>
                      </div>

                      {/* Facilities */}
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Facilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {venue.facilities.map((facility, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Schedule
                        </Button>
                        {venue.status === 'available' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Book
                          </Button>
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

          <TabsContent value="invigilators" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invigilator Management</CardTitle>
                <CardDescription>Assign and manage exam invigilators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">25</p>
                        <p className="text-sm text-gray-600">Available Faculty</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">18</p>
                        <p className="text-sm text-gray-600">Assigned</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">7</p>
                        <p className="text-sm text-gray-600">Unassigned</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Dr. Rajesh Kumar", department: "Computer Science", assigned: 3, available: true },
                    { name: "Prof. Priya Sharma", department: "Electronics", assigned: 2, available: true },
                    { name: "Dr. Amit Singh", department: "Mathematics", assigned: 4, available: false },
                    { name: "Prof. Sarah Williams", department: "Management", assigned: 1, available: true }
                  ].map((invigilator, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{invigilator.name}</h4>
                              <p className="text-sm text-gray-600">{invigilator.department}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium">{invigilator.assigned}</p>
                              <p className="text-xs text-gray-600">Assigned</p>
                            </div>
                            <Badge className={invigilator.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {invigilator.available ? 'Available' : 'Busy'}
                            </Badge>
                            <Button size="sm" variant="outline">
                              {invigilator.available ? 'Assign' : 'View Schedule'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Exam Calendar</CardTitle>
                <CardDescription>View exam schedule in calendar format</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium py-2">{day}</div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 6; // Adjust for proper calendar layout
                    const hasExam = Math.random() > 0.7; // Random exam assignment for demo
                    
                    return (
                      <div key={i} className={`h-24 border rounded p-1 ${
                        day <= 0 || day > 31 ? 'bg-gray-50' : 
                        hasExam ? 'bg-blue-50 border-blue-200' : 
                        'bg-white hover:bg-gray-50'
                      }`}>
                        {day > 0 && day <= 31 && (
                          <>
                            <div className="text-sm font-medium">{day}</div>
                            {hasExam && (
                              <div className="text-xs bg-blue-100 text-blue-800 p-1 rounded mt-1">
                                CS301
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-4 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
                    <span>Exam Scheduled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
                    <span>Exam Confirmed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
                    <span>Exam Postponed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.slice(1).map((course) => {
                      const courseExams = examSchedules.filter(e => e.course === course);
                      const confirmedExams = courseExams.filter(e => e.status === 'confirmed').length;
                      
                      return (
                        <div key={course}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{course}</span>
                            <span>{confirmedExams}/{courseExams.length} confirmed</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: courseExams.length > 0 ? `${(confirmedExams / courseExams.length) * 100}%` : '0%' }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Venue Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {venues.map((venue) => {
                      const venueExams = examSchedules.filter(e => e.venue === venue.name).length;
                      const utilizationRate = Math.min((venueExams * 20), 100); // Mock calculation
                      
                      return (
                        <div key={venue.id}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{venue.name}</span>
                            <span>{venueExams} exams ({utilizationRate}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${utilizationRate}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>Create exam schedule and analysis reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <CalendarDays className="h-4 w-4" />
                        <span className="font-medium">Complete Schedule</span>
                      </div>
                      <p className="text-sm text-gray-600">Full exam timetable for all courses</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">Student Allocation</span>
                      </div>
                      <p className="text-sm text-gray-600">Student-wise exam schedule</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="h-4 w-4" />
                        <span className="font-medium">Venue Report</span>
                      </div>
                      <p className="text-sm text-gray-600">Venue-wise exam allocation</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <UserCheck className="h-4 w-4" />
                        <span className="font-medium">Invigilator Duty</span>
                      </div>
                      <p className="text-sm text-gray-600">Faculty duty assignment report</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
