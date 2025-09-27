"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText, 
  Download,
  Award,
  BookOpen,
  CheckCircle,
  Star,
  TrendingUp
} from "lucide-react";

export default function StudentExamsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock exam data
  const upcomingExams = [
    {
      id: 1,
      subject: "Data Structures & Algorithms",
      code: "CS301",
      date: "2024-10-15",
      time: "10:00 AM - 1:00 PM",
      duration: "3 hours",
      venue: "Hall A, Block 2",
      type: "Mid-term",
      syllabus: "Units 1-3"
    },
    {
      id: 2,
      subject: "Database Management Systems",
      code: "CS302",
      date: "2024-10-18",
      time: "2:00 PM - 5:00 PM",
      duration: "3 hours",
      venue: "Hall B, Block 2",
      type: "Mid-term",
      syllabus: "Units 1-2"
    },
    {
      id: 3,
      subject: "Computer Networks",
      code: "CS303",
      date: "2024-10-22",
      time: "10:00 AM - 1:00 PM",
      duration: "3 hours",
      venue: "Hall C, Block 3",
      type: "Mid-term",
      syllabus: "Units 1-4"
    }
  ];

  const pastResults = [
    {
      id: 1,
      subject: "Object Oriented Programming",
      code: "CS201",
      examType: "End-term",
      maxMarks: 100,
      obtainedMarks: 87,
      grade: "A",
      semester: "Semester 4",
      date: "2024-05-20"
    },
    {
      id: 2,
      subject: "Discrete Mathematics",
      code: "CS202",
      examType: "End-term",
      maxMarks: 100,
      obtainedMarks: 92,
      grade: "A+",
      semester: "Semester 4",
      date: "2024-05-18"
    },
    {
      id: 3,
      subject: "Computer Organization",
      code: "CS203",
      examType: "End-term",
      maxMarks: 100,
      obtainedMarks: 78,
      grade: "B+",
      semester: "Semester 4",
      date: "2024-05-15"
    },
    {
      id: 4,
      subject: "Web Technologies",
      code: "CS204",
      examType: "End-term",
      maxMarks: 100,
      obtainedMarks: 95,
      grade: "A+",
      semester: "Semester 4",
      date: "2024-05-12"
    }
  ];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-blue-100 text-blue-800';
      case 'B+': return 'bg-yellow-100 text-yellow-800';
      case 'B': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculatePercentage = (obtained: number, max: number) => {
    return ((obtained / max) * 100).toFixed(1);
  };

  const averageMarks = pastResults.reduce((sum, result) => sum + result.obtainedMarks, 0) / pastResults.length;

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
              <div className="text-2xl font-bold text-green-600">{averageMarks.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Last semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{upcomingExams.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastResults.length}</div>
              <p className="text-xs text-muted-foreground">Last semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Grade</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">A+</div>
              <p className="text-xs text-muted-foreground">Highest achievement</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Exams</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
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
                          <CardTitle className="text-lg">{exam.subject}</CardTitle>
                          <CardDescription>
                            {exam.code} • {exam.type} Examination
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-blue-50">
                          {exam.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{new Date(exam.date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-600">Exam Date</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{exam.time}</p>
                            <p className="text-xs text-gray-600">Duration: {exam.duration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{exam.venue}</p>
                            <p className="text-xs text-gray-600">Venue</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{exam.syllabus}</p>
                            <p className="text-xs text-gray-600">Syllabus</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Admit Card
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4 mr-2" />
                          Syllabus
                        </Button>
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
                    You don&apos;t have any scheduled exams at the moment. Check back later for updates.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-4">
            <div className="grid gap-4">
              {pastResults.map((result) => (
                <Card key={result.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{result.subject}</h3>
                        <p className="text-sm text-gray-600">{result.code} • {result.examType} • {result.semester}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={getGradeColor(result.grade)}>
                            {result.grade}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{new Date(result.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Marks Obtained</p>
                        <p className="font-semibold text-lg">{result.obtainedMarks}/{result.maxMarks}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Percentage</p>
                        <p className="font-semibold text-lg">{calculatePercentage(result.obtainedMarks, result.maxMarks)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Grade</p>
                        <p className="font-semibold text-lg">{result.grade}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Admit Cards</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Download admit cards for upcoming exams
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Grade Cards</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Download official grade cards and transcripts
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Syllabus</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    Access exam syllabus and study materials
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex flex-col items-center p-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Exam Schedule</h3>
                  <p className="text-sm text-gray-600 text-center mb-4">
                    View complete examination timetable
                  </p>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
