"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { mockAssignments } from "@/lib/mock-data";
import { 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  BookOpen,
  Upload,
  Download,
  Loader2,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";

export default function StudentAssignmentsPage() {
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
      <DashboardLayout title="Assignments" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading assignments...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const pendingAssignments = mockAssignments.filter(a => a.status === 'pending');
  const submittedAssignments = mockAssignments.filter(a => a.status === 'submitted');
  const gradedAssignments = mockAssignments.filter(a => a.status === 'graded');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'submitted':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'destructive';
      case 'submitted':
        return 'default';
      case 'graded':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <DashboardLayout title="Assignments" userRole="student">
      <div className="space-y-6">
        {/* Assignment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockAssignments.length}</div>
              <p className="text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingAssignments.length}</div>
              <p className="text-xs text-muted-foreground">Due soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{submittedAssignments.length}</div>
              <p className="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Graded</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{gradedAssignments.length}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Assignments ({mockAssignments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
            <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {mockAssignments.map((assignment) => (
              <Card key={assignment.id} className={`${isOverdue(assignment.dueDate) && assignment.status === 'pending' ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.course} ({assignment.courseCode})
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(assignment.status)}
                      <Badge variant={getStatusColor(assignment.status) as any}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Due Date</p>
                        <p className={`${isOverdue(assignment.dueDate) && assignment.status === 'pending' ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                          {new Date(assignment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Total Marks</p>
                        <p className="text-muted-foreground">{assignment.totalMarks}</p>
                      </div>
                    </div>
                    
                    {assignment.obtainedMarks && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="font-medium">Obtained</p>
                          <p className="text-green-600 font-semibold">{assignment.obtainedMarks}/{assignment.totalMarks}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Course</p>
                        <p className="text-muted-foreground">{assignment.courseCode}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {assignment.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => toast.success(`Downloading ${assignment.title} (Demo)`)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.success(`Submitting ${assignment.title} (Demo)`)}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      </>
                    )}
                    
                    {assignment.status === 'submitted' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.info(`${assignment.title} is under review`)}
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Under Review
                      </Button>
                    )}
                    
                    {assignment.status === 'graded' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.success(`Viewing feedback for ${assignment.title} (Demo)`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Feedback
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssignments.map((assignment) => (
              <Card key={assignment.id} className={`${isOverdue(assignment.dueDate) ? 'border-red-200 bg-red-50' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.course} ({assignment.courseCode})
                      </CardDescription>
                    </div>
                    <Badge variant="destructive">
                      {isOverdue(assignment.dueDate) ? 'Overdue' : 'Pending'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Due Date:</span>
                    <span className={`${isOverdue(assignment.dueDate) ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => toast.success(`Downloading ${assignment.title} (Demo)`)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => toast.success(`Submitting ${assignment.title} (Demo)`)}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      Submit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submittedAssignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.course} ({assignment.courseCode})
                      </CardDescription>
                    </div>
                    <Badge variant="default">Submitted</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Submitted on:</span>
                    <span className="text-muted-foreground">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.info(`${assignment.title} is under review`)}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Under Review
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="graded" className="space-y-4">
            {gradedAssignments.map((assignment) => (
              <Card key={assignment.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription>
                        {assignment.course} ({assignment.courseCode})
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Graded</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{assignment.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Score:</span>
                      <span className="text-green-600 font-semibold">
                        {assignment.obtainedMarks}/{assignment.totalMarks}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Percentage:</span>
                      <span className="text-green-600 font-semibold">
                        {assignment.obtainedMarks ? Math.round((assignment.obtainedMarks / assignment.totalMarks) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success(`Viewing feedback for ${assignment.title} (Demo)`)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Feedback
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
