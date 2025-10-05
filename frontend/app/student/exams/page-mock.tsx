"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { mockExamRecords } from "@/lib/mock-data";
import { 
  Calendar, 
  Clock,
  FileText, 
  Download,
  Award,
  BookOpen,
  CheckCircle,
  Star,
  TrendingUp,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

export default function StudentExamsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [router]);

  if (loading || !user) {
    return (
      <DashboardLayout title="Examinations" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading exam information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const scheduledExams = mockExamRecords.filter(exam => exam.status === 'scheduled');
  const completedExams = mockExamRecords.filter(exam => exam.status === 'graded');
  
  const averageMarks = completedExams.length > 0 
    ? Math.round(completedExams.reduce((sum, exam) => sum + (exam.obtainedMarks || 0), 0) / completedExams.length)
    : 0;

  const getGrade = (obtained: number, total: number) => {
    const percentage = (obtained / total) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    return 'F';
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'text-green-600';
      case 'B+':
      case 'B':
        return 'text-blue-600';
      case 'C':
        return 'text-yellow-600';
      default:
        return 'text-red-600';
    }
  };

  return (
    <DashboardLayout title="Examinations" userRole="student">
      <div className="space-y-6">
        {/* Exam Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockExamRecords.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{scheduledExams.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedExams.length}</div>
              <p className="text-xs text-muted-foreground">Results available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{averageMarks}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>

        {/* Exams Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming Exams ({scheduledExams.length})</TabsTrigger>
            <TabsTrigger value="results">Exam Results ({completedExams.length})</TabsTrigger>
            <TabsTrigger value="schedule">Full Schedule</TabsTrigger>
          </TabsList>

          {/* Upcoming Exams */}
          <TabsContent value="upcoming" className="space-y-4">
            {scheduledExams.length > 0 ? (
              scheduledExams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{exam.subject}</CardTitle>
                        <CardDescription>
                          {exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)} Examination
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Scheduled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Exam Date</p>
                          <p className="text-muted-foreground">{new Date(exam.examDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Max Marks</p>
                          <p className="text-muted-foreground">{exam.maxMarks}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Type</p>
                          <p className="text-muted-foreground">{exam.examType}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.success(`Downloading syllabus for ${exam.subject} (Demo)`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Syllabus
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.success(`Viewing study materials for ${exam.subject} (Demo)`)}
                      >
                        <BookOpen className="h-4 w-4 mr-1" />
                        Study Materials
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No upcoming exams scheduled</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Exam Results */}
          <TabsContent value="results" className="space-y-4">
            {completedExams.length > 0 ? (
              completedExams.map((exam) => {
                const percentage = exam.obtainedMarks ? Math.round((exam.obtainedMarks / exam.maxMarks) * 100) : 0;
                const grade = exam.obtainedMarks ? getGrade(exam.obtainedMarks, exam.maxMarks) : 'N/A';
                
                return (
                  <Card key={exam.id} className="border-green-200 bg-green-50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{exam.subject}</CardTitle>
                          <CardDescription>
                            {exam.examType.charAt(0).toUpperCase() + exam.examType.slice(1)} Examination
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" className={`text-lg font-bold ${getGradeColor(grade)}`}>
                            {grade}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">{percentage}%</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Exam Date</p>
                            <p className="text-muted-foreground">{new Date(exam.examDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Score</p>
                            <p className="text-green-600 font-semibold">{exam.obtainedMarks}/{exam.maxMarks}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Percentage</p>
                            <p className="text-green-600 font-semibold">{percentage}%</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Grade</p>
                            <p className={`font-semibold ${getGradeColor(grade)}`}>{grade}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => toast.success(`Downloading result for ${exam.subject} (Demo)`)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Result
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.success(`Viewing answer sheet for ${exam.subject} (Demo)`)}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View Answer Sheet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No exam results available yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Full Schedule */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Examination Schedule</CardTitle>
                <CardDescription>Complete exam timetable for the current semester</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockExamRecords.map((exam) => (
                    <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium">{new Date(exam.examDate).toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">{exam.examType}</p>
                        </div>
                        <div>
                          <p className="font-medium">{exam.subject}</p>
                          <p className="text-sm text-muted-foreground">Max Marks: {exam.maxMarks}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={exam.status === 'scheduled' ? 'outline' : 'secondary'}>
                          {exam.status === 'scheduled' ? 'Upcoming' : 'Completed'}
                        </Badge>
                        {exam.obtainedMarks && (
                          <p className="text-sm text-green-600 font-semibold mt-1">
                            {exam.obtainedMarks}/{exam.maxMarks}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Performance Summary */}
        {completedExams.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
              <CardDescription>Your overall examination performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{completedExams.length}</div>
                  <p className="text-sm text-muted-foreground">Exams Completed</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{averageMarks}%</div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {completedExams.filter(exam => exam.obtainedMarks && (exam.obtainedMarks / exam.maxMarks) >= 0.8).length}
                  </div>
                  <p className="text-sm text-muted-foreground">A Grades</p>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.max(...completedExams.map(exam => exam.obtainedMarks || 0))}
                  </div>
                  <p className="text-sm text-muted-foreground">Highest Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
