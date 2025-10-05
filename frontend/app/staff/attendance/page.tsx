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
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileCheck,
  Save,
  RefreshCw,
  Users,
  CalendarDays,
  BookOpen,
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

interface TimetableClass {
  id: string;
  period: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classType: string;
  course: {
    id: string;
    code: string;
    name: string;
    courseType: string;
  };
  section: {
    id: string;
    name: string;
    code: string;
    batch: string;
    semester: number;
    currentStrength: number;
  };
}

interface Student {
  id: string;
  rollNumber: string;
  enrollmentNumber: string;
  name: string;
  email: string;
  batch: string;
  currentSemester: number;
  attendance?: {
    id: string;
    status: string;
    topic?: string;
    classType: string;
    markedAt: string;
  } | null;
}

interface AttendanceRecord {
  studentId: string;
  status: string;
}

interface Section {
  id: string;
  name: string;
  code: string;
  semester: number;
  currentStrength: number;
  department: {
    name: string;
    code: string;
  };
}

interface SectionAttendanceData {
  student: {
    id: string;
    rollNumber: string;
    name: string;
    email: string;
  };
  subjects: {
    [subjectCode: string]: {
      present: number;
      total: number;
      percentage: number;
    };
  };
  overallPresent: number;
  overallTotal: number;
  overallPercentage: number;
}

export default function PeriodWiseAttendancePage() {
  // User state
  const [user, setUser] = useState<any>(null);

  // Common states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Period-wise attendance states
  const [classes, setClasses] = useState<TimetableClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<TimetableClass | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, string>>(new Map());
  const [topic, setTopic] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Section-wise view states
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [sectionAttendanceData, setSectionAttendanceData] = useState<SectionAttendanceData[]>([]);
  const [sectionLoading, setSectionLoading] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (user) {
      fetchFacultyClasses();
    }
  }, [user, selectedDate]);

  // Auto-select first class when classes change
  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      const firstClass = classes[0];
      setSelectedClass(firstClass);
      fetchClassStudents(firstClass);
    }
  }, [classes]);

  const fetchFacultyClasses = async () => {
    try {
      setLoading(true);
      console.log(`📅 Fetching classes for date: ${selectedDate}`);
      
      const response = await api.get(`/api/faculty/attendance/classes?date=${selectedDate}`);
      
      if (response.data.success) {
        const fetchedClasses = response.data.data;
        setClasses(fetchedClasses);
        console.log(`✅ Found ${fetchedClasses.length} classes for today`);
        
        // Clear selected class and students when date changes
        setSelectedClass(null);
        setStudents([]);
        setAttendanceRecords(new Map());
      }
    } catch (error: any) {
      console.error('❌ Error fetching classes:', error);
      alert(error.response?.data?.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async (classData: TimetableClass) => {
    try {
      setLoading(true);
      console.log(`📚 Fetching students for class:`, {
        courseCode: classData.course.code,
        courseId: classData.course.id,
        sectionId: classData.section.id,
        period: classData.period,
        date: selectedDate
      });
      
      const response = await api.get(
        `/api/faculty/attendance/students/${classData.course.id}/${classData.section.id}?date=${selectedDate}&period=${classData.period}`
      );

      console.log('📥 Students API response:', response.data);

      if (response.data.success) {
        const studentData = response.data.data;
        setStudents(studentData);
        console.log(`✅ Loaded ${studentData.length} students`);

        // Load existing attendance from database
        const newRecords = new Map<string, string>();
        let loadedCount = 0;
        
        studentData.forEach((student: Student) => {
          if (student.attendance) {
            newRecords.set(student.id, student.attendance.status);
            loadedCount++;
          }
        });
        
        setAttendanceRecords(newRecords);
        setHasUnsavedChanges(false);
        
        if (loadedCount > 0) {
          console.log(`📋 Loaded ${loadedCount} existing attendance records`);
        } else {
          console.log(`📝 No existing attendance - ready for marking`);
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching students:', error);
      console.error('Error details:', error.response?.data);
      
      // Clear students on error
      setStudents([]);
      setAttendanceRecords(new Map());
      
      const errorMessage = error.response?.data?.message || 'Failed to fetch students';
      alert(`Error: ${errorMessage}\n\nPlease check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classId: string) => {
    console.log('🖱️ Class card clicked:', classId);
    
    if (hasUnsavedChanges) {
      const confirmSwitch = window.confirm(
        '⚠️ You have unsaved attendance records.\n\nDo you want to switch classes and lose these changes?'
      );
      
      if (!confirmSwitch) {
        console.log('⏸️ Class switch cancelled by user');
        return;
      }
    }

    const classData = classes.find(c => c.id === classId);
    if (classData) {
      console.log('✅ Setting selected class:', classData.course.code, '-', classData.section.name);
      setSelectedClass(classData);
      setAttendanceRecords(new Map());
      setTopic('');
      setStudents([]); // Clear previous students immediately
      fetchClassStudents(classData);
    } else {
      console.error('❌ Class not found for ID:', classId);
    }
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    const newRecords = new Map(attendanceRecords);
    newRecords.set(studentId, status);
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const markAllPresent = () => {
    const newRecords = new Map<string, string>();
    students.forEach(student => {
      newRecords.set(student.id, 'present');
    });
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const markAllAbsent = () => {
    const newRecords = new Map<string, string>();
    students.forEach(student => {
      newRecords.set(student.id, 'absent');
    });
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      alert('Please select a class');
      return;
    }

    if (attendanceRecords.size === 0) {
      alert('⚠️ No attendance records to save. Please mark attendance for at least one student.');
      return;
    }

    try {
      setSaving(true);
      const attendanceData: AttendanceRecord[] = Array.from(attendanceRecords.entries()).map(([studentId, status]) => ({
        studentId,
        status
      }));

      console.log('📤 Submitting attendance:', {
        courseId: selectedClass.course.id,
        sectionId: selectedClass.section.id,
        date: selectedDate,
        period: selectedClass.period,
        classType: selectedClass.classType,
        topic: topic,
        recordsCount: attendanceData.length
      });

      const response = await api.post('/api/faculty/attendance/mark', {
        courseId: selectedClass.course.id,
        sectionId: selectedClass.section.id,
        date: selectedDate,
        period: selectedClass.period,
        classType: selectedClass.classType,
        topic: topic,
        attendanceRecords: attendanceData
      });

      if (response.data.success) {
        alert(`✅ Attendance marked successfully for ${response.data.data.marked} students!`);
        setHasUnsavedChanges(false);
        
        // Refresh the students list to show updated attendance
        await fetchClassStudents(selectedClass);
      }
    } catch (error: any) {
      console.error('❌ Error marking attendance:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
      switch (status) {
      case 'present': return 'text-green-600 bg-green-50 border-green-200';
      case 'absent': return 'text-red-600 bg-red-50 border-red-200';
      case 'late': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'excused': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const currentStats = {
    total: attendanceRecords.size,
    present: Array.from(attendanceRecords.values()).filter(s => s === 'present').length,
    absent: Array.from(attendanceRecords.values()).filter(s => s === 'absent').length,
    late: Array.from(attendanceRecords.values()).filter(s => s === 'late').length,
    excused: Array.from(attendanceRecords.values()).filter(s => s === 'excused').length,
  };

  const fetchSections = async () => {
    try {
      setSectionLoading(true);
      
      // Get faculty's department
      const facultyResponse = await api.get('/api/faculty/profile');
      if (!facultyResponse.data.success) {
        throw new Error('Failed to fetch faculty profile');
      }

      const departmentId = facultyResponse.data.data.departmentId;
      
      // Fetch sections for this department
      const response = await api.get(`/api/sections?departmentId=${departmentId}`);
      
      if (response.data.success) {
        setSections(response.data.data);
        console.log(`✅ Loaded ${response.data.data.length} sections`);
      }
    } catch (error: any) {
      console.error('Error fetching sections:', error);
      alert(error.response?.data?.message || 'Failed to fetch sections');
    } finally {
      setSectionLoading(false);
    }
  };

  const fetchSectionAttendance = async (section: Section) => {
    try {
      setSectionLoading(true);
      console.log(`📊 Fetching attendance for section: ${section.name}`);

      const response = await api.get(
        `/api/faculty/attendance/summary/section/${section.id}?startDate=${selectedDate}&endDate=${selectedDate}`
      );

      console.log('📥 Section attendance response:', response.data);

      if (response.data.success) {
        // Transform the data for display
        const students = response.data.data.students || [];
        setSectionAttendanceData(students);
        console.log(`✅ Loaded attendance for ${students.length} students`);
      }
    } catch (error: any) {
      console.error('Error fetching section attendance:', error);
      console.error('Error details:', error.response?.data);
      alert(error.response?.data?.message || 'Failed to fetch section attendance');
    } finally {
      setSectionLoading(false);
    }
  };

  const handleSectionSelect = (section: Section) => {
    console.log('🖱️ Section card clicked:', section.name);
    setSelectedSection(section);
    fetchSectionAttendance(section);
  };

  const percentage = currentStats.total > 0 
    ? ((currentStats.present / currentStats.total) * 100).toFixed(1)
    : '0';

  return (
    <DashboardLayout userRole={user?.role || 'faculty'} title="Attendance Management">
      <Tabs defaultValue="period-wise" className="space-y-6">
        <TabsList>
          <TabsTrigger value="period-wise">
            <CalendarDays className="h-4 w-4 mr-2" />
            Mark Attendance (Period-wise)
          </TabsTrigger>
          <TabsTrigger value="section-wise" onClick={fetchSections}>
            <Users className="h-4 w-4 mr-2" />
            View by Section
          </TabsTrigger>
        </TabsList>

        {/* PERIOD-WISE TAB */}
        <TabsContent value="period-wise">
      <div className="space-y-6">

        {/* Date Selection */}
          <Card>
            <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>Choose a date to view and mark attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="attendance-date">Date</Label>
                <Input
                  id="attendance-date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="pt-6">
                <Button onClick={fetchFacultyClasses} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Classes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes for Selected Date */}
        <Card>
          <CardHeader>
            <CardTitle>Your Classes - {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardTitle>
            <CardDescription>{classes.length} classes scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            {classes.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {classes.map((classData) => (
                  <Card
                    key={classData.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedClass?.id === classData.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => handleClassSelect(classData.id)}
                  >
                    <CardContent className="pt-6">
                <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Period {classData.period}</Badge>
                          <Badge className={getStatusColor(classData.classType)}>
                            {classData.classType}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-lg">{classData.course.code}</h3>
                        <p className="text-sm text-muted-foreground">{classData.course.name}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {classData.startTime} - {classData.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{classData.section.name} ({classData.section.currentStrength} students)</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No classes scheduled for this date</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {selectedClass && loading && students.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading students for {selectedClass.course.code}...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance Marking Section */}
        {selectedClass && students.length > 0 && (
            <>
              {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{currentStats.total}</p>
                    <p className="text-sm text-muted-foreground">Marked</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold">{currentStats.present}</p>
                      <p className="text-sm text-muted-foreground">Present</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                      <p className="text-2xl font-bold">{currentStats.absent}</p>
                      <p className="text-sm text-muted-foreground">Absent</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <p className="text-2xl font-bold">{currentStats.late}</p>
                      <p className="text-sm text-muted-foreground">Late</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <FileCheck className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{currentStats.excused}</p>
                      <p className="text-sm text-muted-foreground">Excused</p>
                    </div>
                  </CardContent>
                </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{percentage}%</p>
                    <p className="text-sm text-muted-foreground">Present %</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                    <CardTitle>
                      {selectedClass.course.code} - {selectedClass.section.name} - Period {selectedClass.period}
                    </CardTitle>
                      <CardDescription>{students.length} students</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={markAllPresent}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        All Present
                      </Button>
                      <Button variant="outline" size="sm" onClick={markAllAbsent}>
                        <XCircle className="h-4 w-4 mr-2" />
                        All Absent
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              <CardContent className="space-y-4">
                {/* Topic Input */}
                <div>
                  <Label htmlFor="topic">Topic Covered (Optional)</Label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="E.g., Introduction to Data Structures"
                    className="mt-1"
                  />
                </div>

                {/* Students Table */}
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                        <TableHead className="w-[100px]">Roll No.</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Enrollment No.</TableHead>
                        <TableHead className="w-[300px]">Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                                {student.name.charAt(0).toUpperCase()}
                              </div>
                              <span>{student.name}</span>
                            </div>
                          </TableCell>
                            <TableCell className="text-muted-foreground">
                              {student.enrollmentNumber}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant={attendanceRecords.get(student.id) === 'present' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(student.id, 'present')}
                                  className={attendanceRecords.get(student.id) === 'present' ? 'bg-green-600 hover:bg-green-700' : ''}
                                >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Present
                                </Button>
                                <Button
                                  size="sm"
                                  variant={attendanceRecords.get(student.id) === 'absent' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(student.id, 'absent')}
                                  className={attendanceRecords.get(student.id) === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                <XCircle className="h-4 w-4 mr-1" />
                                Absent
                                </Button>
                                <Button
                                  size="sm"
                                  variant={attendanceRecords.get(student.id) === 'late' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(student.id, 'late')}
                                  className={attendanceRecords.get(student.id) === 'late' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                >
                                <Clock className="h-4 w-4 mr-1" />
                                Late
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                {/* Save Button */}
                <div className="flex justify-between items-center pt-4 border-t">
                    {hasUnsavedChanges && (
                      <div className="text-sm text-orange-600 font-medium">
                        ⚠️ You have unsaved changes
                      </div>
                    )}
                    {!hasUnsavedChanges && attendanceRecords.size > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        ✅ All changes saved
                      </div>
                    )}
                    {!hasUnsavedChanges && attendanceRecords.size === 0 && (
                      <div></div>
                    )}
                    <Button onClick={handleSubmit} disabled={saving || !hasUnsavedChanges} size="lg">
                      <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                      {saving ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

        {selectedClass && students.length === 0 && !loading && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">No students found in this section</p>
                <p className="text-sm mt-2">
                  Section: {selectedClass.section.name} | Course: {selectedClass.course.code}
                </p>
                <p className="text-sm mt-1">
                  Please ensure students are enrolled in this section.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
        </TabsContent>

        {/* SECTION-WISE TAB */}
        <TabsContent value="section-wise">
          <div className="space-y-6">
            {/* Section Cards */}
            <Card>
              <CardHeader>
                <CardTitle>Select Section to View Attendance</CardTitle>
                <CardDescription>Click on a section to view comprehensive attendance data</CardDescription>
              </CardHeader>
              <CardContent>
                {sectionLoading && !selectedSection ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading sections...</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sections.map((section) => (
                      <Card
                        key={section.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedSection?.id === section.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleSectionSelect(section)}
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold text-lg">{section.name}</h3>
                              <Badge variant="outline">Sem {section.semester}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{section.code}</p>
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>{section.currentStrength} students</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {sections.length === 0 && !sectionLoading && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No sections found for your department</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Section Attendance Data */}
            {selectedSection && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedSection.name} - Attendance Overview</CardTitle>
                      <CardDescription>
                        Showing attendance data for {selectedDate} | {sectionAttendanceData.length} students
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedSection(null);
                        setSectionAttendanceData([]);
                      }}
                    >
                      Back to Sections
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {sectionLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading attendance data...</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white z-10">
                          <TableRow>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="text-right">Total Classes</TableHead>
                            <TableHead className="text-right">Present</TableHead>
                            <TableHead className="text-right">Absent</TableHead>
                            <TableHead className="text-right">Attendance %</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sectionAttendanceData.map((studentData: any) => {
                            const percentage = studentData.overallPercentage || 0;
                            const statusColor = percentage >= 75 
                              ? 'bg-green-100 text-green-800' 
                              : percentage >= 60 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-red-100 text-red-800';
                            
                            return (
                              <TableRow key={studentData.student.id}>
                                <TableCell className="font-medium">{studentData.student.rollNumber}</TableCell>
                                <TableCell>{studentData.student.name}</TableCell>
                                <TableCell className="text-right">{studentData.overallTotal || 0}</TableCell>
                                <TableCell className="text-right text-green-600 font-medium">
                                  {studentData.overallPresent || 0}
                                </TableCell>
                                <TableCell className="text-right text-red-600 font-medium">
                                  {(studentData.overallTotal || 0) - (studentData.overallPresent || 0)}
                                </TableCell>
                                <TableCell className="text-right font-bold text-lg">
                                  {percentage.toFixed(1)}%
                                </TableCell>
                                <TableCell>
                                  <Badge className={statusColor}>
                                    {percentage >= 75 ? 'Good' : percentage >= 60 ? 'Warning' : 'Critical'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {sectionAttendanceData.length === 0 && !sectionLoading && (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No attendance data found for this section on {selectedDate}</p>
                      <p className="text-sm mt-2">Try selecting a different date or check if attendance has been marked</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
