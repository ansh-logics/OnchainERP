"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { 
  Calendar, 
  Clock,
  FileText, 
  Download,
  Award,
  BookOpen,
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react";

interface ExamResult {
  id: string;
  examId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  examType: string;
  examDate: string;
  marksObtained: number;
  totalMarks: number;
  passingMarks: number;
  grade: string | null;
  percentage: string;
  isPassed: boolean;
  remarks: string | null;
}

interface UpcomingExam {
  id: string;
  examType: string;
  examDate: string;
  startTime: string;
  totalMarks: number;
  passingMarks: number;
  course: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
}

export default function StudentExamsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [upcomingExams, setUpcomingExams] = useState<UpcomingExam[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
    fetchExamData();
  }, [router]);

  const fetchExamData = async () => {
    try {
      setLoading(true);
      
      const [resultsRes, upcomingRes] = await Promise.all([
        api.get('/api/student-services/results'),
        api.get('/api/student-services/exams/upcoming')
      ]);
      
      if (resultsRes.data.success) {
        setResults(resultsRes.data.data.results);
        setStatistics(resultsRes.data.data.statistics);
      }
      
      if (upcomingRes.data.success) {
        setUpcomingExams(upcomingRes.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching exam data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'bg-gray-100 text-gray-800';
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B+': return 'bg-yellow-100 text-yellow-800';
      case 'B': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="Examinations" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading exam data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Examinations" userRole="student">
      <div className="space-y-6">
        {/* Academic Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics?.averagePercentage || 0}%
              </div>
              <p className="text-xs text-muted-foreground">All exams</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingExams.length}</div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.totalExams || 0}</div>
              <p className="text-xs text-muted-foreground">Passed: {statistics?.passedExams || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CGPA</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics?.cgpa?.toFixed(2) || '0.00'}
              </div>
              <p className="text-xs text-muted-foreground">Out of 10.0</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          {/* Upcoming Exams Tab */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingExams.length > 0 ? (
              <div className="grid gap-4">
                {upcomingExams.map((exam) => (
                  <Card key={exam.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{exam.course?.name}</CardTitle>
                          <CardDescription>
                            {exam.course?.code} • {exam.examType} Examination
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50">
                          {exam.examType}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{new Date(exam.examDate).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-600">Exam Date</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{exam.startTime}</p>
                            <p className="text-xs text-gray-600">Start Time</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{exam.totalMarks} marks</p>
                            <p className="text-xs text-gray-600">Total Marks</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Exams</h3>
                  <p className="text-gray-600 text-center">
                    You don&apos;t have any scheduled exams at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            {results.length > 0 ? (
              <div className="grid gap-4">
                {results.map((result) => (
                  <Card key={result.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{result.courseName}</h3>
                          <p className="text-sm text-gray-600">{result.courseCode} • {result.examType}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            {result.grade && (
                              <Badge className={getGradeColor(result.grade)}>
                                {result.grade}
                              </Badge>
                            )}
                            <Badge variant={result.isPassed ? 'default' : 'destructive'}>
                              {result.isPassed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{new Date(result.examDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Marks Obtained</p>
                          <p className="font-semibold text-lg">{result.marksObtained}/{result.totalMarks}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Percentage</p>
                          <p className="font-semibold text-lg">{result.percentage}%</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Grade</p>
                          <p className="font-semibold text-lg">{result.grade || 'N/A'}</p>
                        </div>
                      </div>
                      
                      {result.remarks && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                          <p className="text-gray-600"><strong>Remarks:</strong> {result.remarks}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No exam results available yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
