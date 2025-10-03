'use client';

import { useState, useEffect } from 'react';
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
  CalendarDays
} from 'lucide-react';
import { api } from '@/lib/api';

interface Section {
    id: string;
    name: string;
    code: string;
    batch: string;
    semester: number;
    currentStrength: number;
  department: {
    name: string;
    code: string;
  };
}

interface Student {
  id: string;
  rollNumber: string;
  enrollmentNumber: string;
  name: string;
  email: string;
  batch: string;
  section?: {
    name: string;
    code: string;
  };
  sectionCode?: string;
  attendanceStatus?: string | null;
}

export default function SimpleAttendancePage() {
  // Common states
  const selectedDate = new Date().toISOString().split('T')[0]; // Always today
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Mark Attendance Tab
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, string>>(new Map());
  const [savedAttendanceRecords, setSavedAttendanceRecords] = useState<Map<string, string>>(new Map());
  
  // View Attendance Tab
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    notMarked: 0
  });

  // Hardcoded department ID for demo (CSE department)
  const DEPARTMENT_ID = 'your-cse-department-id'; // This will be fetched dynamically

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      
      // Get CSE department sections directly
      const deptResponse = await api.get('/api/departments');
      console.log('Departments:', deptResponse.data);
      
      if (!deptResponse.data.data || deptResponse.data.data.length === 0) {
        alert('No departments found.');
        return;
      }

      // Find CSE department
      const cseDept = deptResponse.data.data.find((d: any) => d.code === 'CSE');
      
      if (!cseDept) {
        alert('CSE department not found. Using first department...');
        return;
      }

      const response = await api.get(`/api/faculty/attendance/demo/sections/${cseDept.id}`);
      if (response.data.success) {
        // Show all sections from CSE department
        setSections(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching sections:', error);
      alert(error.response?.data?.message || 'Failed to fetch sections');
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionStudents = async (sectionId: string) => {
    try {
      setLoading(true);
      console.log(`🔄 Fetching students for section ${sectionId} on date ${selectedDate}`);
      
      const response = await api.get(
        `/api/faculty/attendance/demo/section-students/${sectionId}?date=${selectedDate}`
      );

      console.log(`✅ Received ${response.data.count} students`, response.data);

      if (response.data.success) {
        const studentData = response.data.data;
        setStudents(studentData);

        // Load existing attendance from database
        const newRecords = new Map<string, string>();
        let loadedCount = 0;
        
        studentData.forEach((student: Student) => {
          if (student.attendanceStatus && student.attendanceStatus !== 'not_marked') {
            newRecords.set(student.id, student.attendanceStatus);
            loadedCount++;
          }
        });
        
        setAttendanceRecords(newRecords);
        setSavedAttendanceRecords(new Map(newRecords)); // Track what's saved in DB
        setHasUnsavedChanges(false);
        
        if (loadedCount > 0) {
          console.log(`📋 Loaded ${loadedCount} existing attendance records from database`);
        } else {
          console.log(`📝 No existing attendance records found - ready for new entry`);
        }
      }
    } catch (error: any) {
      console.error('❌ Error fetching students:', error);
      alert(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartmentAttendance = async () => {
    try {
      setLoading(true);
      
      // Get CSE department
      const deptResponse = await api.get('/api/departments');
      
      if (!deptResponse.data.data || deptResponse.data.data.length === 0) {
        alert('No departments found.');
        return;
      }

      // Find CSE department
      const cseDept = deptResponse.data.data.find((d: any) => d.code === 'CSE');
      
      if (!cseDept) {
        alert('CSE department not found.');
        return;
      }

      const response = await api.get(
        `/api/faculty/attendance/demo/department-attendance/${cseDept.id}?date=${selectedDate}`
      );

      if (response.data.success) {
        // Show all students from the department
        setAllStudents(response.data.data);
        setStats(response.data.stats);
      }
    } catch (error: any) {
      console.error('Error fetching department attendance:', error);
      alert(error.response?.data?.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string) => {
    // Warn if there are unsaved changes
    if (attendanceRecords.size > 0 && selectedSection) {
      const confirmSwitch = window.confirm(
        `⚠️ You have ${attendanceRecords.size} unsaved attendance records for ${selectedSection.name}.\n\nDo you want to switch sections and lose these changes?`
      );
      
      if (!confirmSwitch) {
        return; // Don't switch, let user save first
      }
    }

    const section = sections.find(s => s.id === sectionId);
    if (section) {
      setSelectedSection(section);
      setAttendanceRecords(new Map()); // Clear records when switching
      fetchSectionStudents(sectionId);
    }
  };

  const handleAttendanceChange = (studentId: string, status: string) => {
    const newRecords = new Map(attendanceRecords);
    newRecords.set(studentId, status);
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true); // Mark as having unsaved changes
  };

  const markAllPresent = () => {
    const newRecords = new Map(attendanceRecords); // Keep existing selections
    students.forEach(student => {
      newRecords.set(student.id, 'present');
    });
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const markAllAbsent = () => {
    const newRecords = new Map(attendanceRecords); // Keep existing selections
    students.forEach(student => {
      newRecords.set(student.id, 'absent');
    });
    setAttendanceRecords(newRecords);
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    if (!selectedSection) {
      alert('Please select a section');
      return;
    }

    // Validate that we have attendance records to save
    if (attendanceRecords.size === 0) {
      alert('⚠️ No attendance records to save. Please mark attendance for at least one student.');
      return;
    }

    try {
      setSaving(true);
      const attendanceData = Array.from(attendanceRecords.entries()).map(([studentId, status]) => ({
        studentId,
        status
      }));

      console.log('📤 Sending attendance data:', {
        sectionId: selectedSection.id,
        sectionName: selectedSection.name,
        date: selectedDate,
        recordsCount: attendanceData.length
      });

      const response = await api.post('/api/faculty/attendance/demo/mark', {
        sectionId: selectedSection.id,
        date: selectedDate,
        attendanceRecords: attendanceData
      });

      console.log('📥 Response received:', response.data);

      if (response.data.success) {
        alert(`✅ Attendance marked for ${response.data.data.marked} students!\n\nCreated: ${response.data.data.created || 0}\nUpdated: ${response.data.data.updated || 0}`);
        
        // Update saved records and clear unsaved flag
        setSavedAttendanceRecords(new Map(attendanceRecords));
        setHasUnsavedChanges(false);
        
        // Refresh both the section students AND the department view
        await fetchSectionStudents(selectedSection.id);
        await fetchDepartmentAttendance();
      }
    } catch (error: any) {
      console.error('❌ Error marking attendance:', error);
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceColor = (status: string | null | undefined) => {
      switch (status) {
      case 'present': return 'text-green-600 bg-green-50';
      case 'absent': return 'text-red-600 bg-red-50';
      case 'late': return 'text-orange-600 bg-orange-50';
      case 'excused': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const currentStats = {
    total: attendanceRecords.size,
    present: Array.from(attendanceRecords.values()).filter(s => s === 'present').length,
    absent: Array.from(attendanceRecords.values()).filter(s => s === 'absent').length,
    late: Array.from(attendanceRecords.values()).filter(s => s === 'late').length,
    excused: Array.from(attendanceRecords.values()).filter(s => s === 'excused').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">
            Simple attendance system for demo
          </p>
        </div>
      </div>

      <Tabs defaultValue="mark" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mark">
            <CalendarDays className="h-4 w-4 mr-2" />
            Mark Attendance
          </TabsTrigger>
          <TabsTrigger value="view" onClick={() => fetchDepartmentAttendance()}>
            <Users className="h-4 w-4 mr-2" />
            View Department Attendance
          </TabsTrigger>
        </TabsList>

        {/* MARK ATTENDANCE TAB */}
        <TabsContent value="mark" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Section</CardTitle>
              <CardDescription>Choose a section to mark attendance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                <Label>Select Section to Mark Attendance</Label>
                <Select value={selectedSection?.id} onValueChange={handleSectionChange}>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose Section A or Section B" />
                    </SelectTrigger>
                    <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name} ({section.currentStrength} students)
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
              </div>
            </CardContent>
          </Card>

          {selectedSection && students.length > 0 && (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold">{currentStats.total}</p>
                      <p className="text-sm text-muted-foreground">Total</p>
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
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Students - {selectedSection.name}</CardTitle>
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
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Roll No.</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Enrollment No.</TableHead>
                          <TableHead>Attendance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.rollNumber}</TableCell>
                            <TableCell>{student.name}</TableCell>
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
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={attendanceRecords.get(student.id) === 'absent' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(student.id, 'absent')}
                                  className={attendanceRecords.get(student.id) === 'absent' ? 'bg-red-600 hover:bg-red-700' : ''}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={attendanceRecords.get(student.id) === 'late' ? 'default' : 'outline'}
                                  onClick={() => handleAttendanceChange(student.id, 'late')}
                                  className={attendanceRecords.get(student.id) === 'late' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                                >
                                  <Clock className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center mt-4">
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

          {selectedSection && students.length === 0 && !loading && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No students found in this section</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* VIEW ATTENDANCE TAB */}
        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Department Attendance</CardTitle>
                  <CardDescription>Combined view of all sections</CardDescription>
                </div>
                <Button onClick={fetchDepartmentAttendance} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-xl font-bold">{stats.total}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                      <p className="text-xl font-bold">{stats.present}</p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <XCircle className="h-6 w-6 mx-auto mb-2 text-red-500" />
                      <p className="text-xl font-bold">{stats.absent}</p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                      <p className="text-xl font-bold">{stats.late}</p>
                      <p className="text-xs text-muted-foreground">Late</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <FileCheck className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-xl font-bold">{stats.excused}</p>
                      <p className="text-xs text-muted-foreground">Excused</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="h-6 w-6 mx-auto mb-2 rounded-full bg-gray-200" />
                      <p className="text-xl font-bold">{stats.notMarked}</p>
                      <p className="text-xs text-muted-foreground">Not Marked</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* All Students Table */}
              <div className="border rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead>Roll No.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Enrollment No.</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.rollNumber}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.section}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {student.enrollmentNumber}
                        </TableCell>
                        <TableCell>
                          <Badge className={getAttendanceColor(student.attendanceStatus)}>
                            {student.attendanceStatus === 'not_marked' ? 'Not Marked' : 
                             student.attendanceStatus || 'Not Marked'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {allStudents.length === 0 && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No students found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
