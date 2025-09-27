"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentUser } from "@/lib/auth";
import { 
  FileText, 
  Calendar, 
  Clock, 
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
  Star,
  BookOpen
} from "lucide-react";

export default function StudentAssignmentsPage() {
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

  // Mock assignment data
  const assignments = [
    {
      id: 1,
      title: "Binary Search Tree Implementation",
      course: "Data Structures & Algorithms",
      courseCode: "CS301",
      dueDate: "2024-10-18T23:59:00Z",
      submittedDate: null,
      status: "pending",
      type: "Programming Assignment",
      maxMarks: 100,
      obtainedMarks: null,
      description: "Implement a Binary Search Tree with insertion, deletion, and traversal operations.",
      files: [],
      instructions: "Submit your code in Java with proper documentation and test cases."
    },
    {
      id: 2,
      title: "Database Normalization Exercise",
      course: "Database Management Systems", 
      courseCode: "CS302",
      dueDate: "2024-10-20T23:59:00Z",
      submittedDate: "2024-10-18T15:30:00Z",
      status: "submitted",
      type: "Theory Assignment",
      maxMarks: 50,
      obtainedMarks: 45,
      description: "Normalize the given database schema to 3NF and explain the process.",
      files: ["normalization_report.pdf"],
      instructions: "Submit a detailed report with step-by-step normalization process."
    },
    {
      id: 3,
      title: "Network Protocol Analysis",
      course: "Computer Networks",
      courseCode: "CS303", 
      dueDate: "2024-10-22T23:59:00Z",
      submittedDate: null,
      status: "pending",
      type: "Lab Report",
      maxMarks: 75,
      obtainedMarks: null,
      description: "Analyze TCP/IP packet flow using Wireshark and document your findings.",
      files: [],
      instructions: "Include screenshots of packet captures and detailed analysis."
    },
    {
      id: 4,
      title: "Software Requirements Documentation",
      course: "Software Engineering",
      courseCode: "CS304",
      dueDate: "2024-10-25T23:59:00Z", 
      submittedDate: null,
      status: "pending",
      type: "Documentation",
      maxMarks: 60,
      obtainedMarks: null,
      description: "Create comprehensive software requirements specification for a library management system.",
      files: [],
      instructions: "Follow IEEE 830 standard for SRS documentation."
    },
    {
      id: 5,
      title: "Sorting Algorithm Performance Analysis",
      course: "Data Structures & Algorithms",
      courseCode: "CS301",
      dueDate: "2024-09-15T23:59:00Z",
      submittedDate: "2024-09-14T18:45:00Z",
      status: "graded",
      type: "Programming Assignment",
      maxMarks: 100,
      obtainedMarks: 92,
      description: "Compare performance of different sorting algorithms with time complexity analysis.",
      files: ["sorting_analysis.java", "performance_report.pdf"],
      instructions: "Submit code implementation and performance comparison report."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted': return <Clock className="h-4 w-4" />;
      case 'graded': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <FileText className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const pendingAssignments = assignments.filter(a => a.status === 'pending');
  const submittedAssignments = assignments.filter(a => a.status === 'submitted');
  const gradedAssignments = assignments.filter(a => a.status === 'graded');
  const totalMarks = gradedAssignments.reduce((sum, a) => sum + (a.obtainedMarks || 0), 0);
  const maxMarks = gradedAssignments.reduce((sum, a) => sum + a.maxMarks, 0);
  const averageScore = maxMarks > 0 ? ((totalMarks / maxMarks) * 100).toFixed(1) : 0;

  return (
    <DashboardLayout title="Assignments" userRole="student">
      <div className="space-y-6">
        {/* Assignment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignments.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAssignments.length}</div>
              <p className="text-xs text-muted-foreground">Due soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{submittedAssignments.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting grades</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{averageScore}%</div>
              <p className="text-xs text-muted-foreground">Graded assignments</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assignments..." className="pl-8" />
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
            <TabsTrigger value="all">All Assignments</TabsTrigger>
          </TabsList>

          {/* Pending Assignments */}
          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.length > 0 ? (
              <div className="space-y-4">
                {pendingAssignments.map((assignment) => {
                  const daysRemaining = getDaysRemaining(assignment.dueDate);
                  const isUrgent = daysRemaining <= 2;
                  
                  return (
                    <Card key={assignment.id} className={`border-l-4 ${isUrgent ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{assignment.title}</CardTitle>
                            <CardDescription>
                              {assignment.courseCode} • {assignment.course} • {assignment.type}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(assignment.status)}>
                              {getStatusIcon(assignment.status)}
                              <span className="ml-1">{assignment.status}</span>
                            </Badge>
                            {isUrgent && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-gray-700">{assignment.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Due Date</p>
                                <p className="text-gray-600">{new Date(assignment.dueDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Time Remaining</p>
                                <p className={`text-gray-600 ${isUrgent ? 'text-red-600 font-medium' : ''}`}>
                                  {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Max Marks</p>
                                <p className="text-gray-600">{assignment.maxMarks}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-sm mb-1">Instructions:</h4>
                            <p className="text-sm text-gray-700">{assignment.instructions}</p>
                          </div>

                          <div className="flex gap-2">
                            <Button>
                              <Upload className="h-4 w-4 mr-2" />
                              Submit Assignment
                            </Button>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Download Resources
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All Caught Up!</h3>
                  <p className="text-gray-600 text-center">
                    You have no pending assignments at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submitted Assignments */}
          <TabsContent value="submitted" className="space-y-4">
            {submittedAssignments.length > 0 ? (
              <div className="space-y-4">
                {submittedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>
                            {assignment.courseCode} • {assignment.course} • {assignment.type}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1">Submitted</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">{assignment.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Submitted On</p>
                              <p className="text-gray-600">{assignment.submittedDate ? new Date(assignment.submittedDate).toLocaleDateString() : 'Not submitted'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Files Submitted</p>
                              <p className="text-gray-600">{assignment.files.length} files</p>
                            </div>
                          </div>
                        </div>

                        {assignment.files.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Submitted Files:</h4>
                            {assignment.files.map((file, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span>{file}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download Submission
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-blue-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-600 text-center">
                    Your submitted assignments will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Graded Assignments */}
          <TabsContent value="graded" className="space-y-4">
            {gradedAssignments.length > 0 ? (
              <div className="space-y-4">
                {gradedAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription>
                            {assignment.courseCode} • {assignment.course} • {assignment.type}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(assignment.status)}>
                            {getStatusIcon(assignment.status)}
                            <span className="ml-1">Graded</span>
                          </Badge>
                          <Badge variant="outline" className="bg-green-50">
                            {assignment.obtainedMarks}/{assignment.maxMarks}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm text-gray-700">{assignment.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Score</p>
                              <p className="text-green-600 font-semibold">
                                {assignment.obtainedMarks}/{assignment.maxMarks} 
                                ({((assignment.obtainedMarks! / assignment.maxMarks) * 100).toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Submitted</p>
                              <p className="text-gray-600">{assignment.submittedDate ? new Date(assignment.submittedDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Grade</p>
                              <p className="text-gray-600">
                                {assignment.obtainedMarks! >= assignment.maxMarks * 0.9 ? 'A' : 
                                 assignment.obtainedMarks! >= assignment.maxMarks * 0.8 ? 'B' : 
                                 assignment.obtainedMarks! >= assignment.maxMarks * 0.7 ? 'C' : 'D'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download Feedback
                          </Button>
                          <Button variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            View Submission
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-yellow-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Grades Yet</h3>
                  <p className="text-gray-600 text-center">
                    Your graded assignments will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* All Assignments */}
          <TabsContent value="all" className="space-y-4">
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{assignment.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{assignment.courseCode} • {assignment.course} • {assignment.type}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          {assignment.obtainedMarks !== null && (
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              Score: {assignment.obtainedMarks}/{assignment.maxMarks}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {getStatusIcon(assignment.status)}
                        <span className="ml-1 capitalize">{assignment.status}</span>
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
