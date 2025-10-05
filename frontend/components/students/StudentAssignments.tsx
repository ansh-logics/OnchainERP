"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Assignment, AssignmentStats, ApiResponse } from '@/types/student';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Upload,
  Download,
  CheckCircle,
  AlertTriangle,
  Search,
  Star,
  BookOpen,
  File,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';

// Types are imported from @/types/student

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissionData, setSubmissionData] = useState<{[key: string]: { text: string; files: FileList | null }}>({});

  useEffect(() => {
    fetchAssignments();
    fetchStats();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('/api/student-services/assignments/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data: ApiResponse<Assignment[]> = await response.json();
        if (data.success && data.data) {
          setAssignments(data.data);
          
          // Initialize submission data for unsubmitted assignments
          const initialSubmissionData: {[key: string]: { text: string; files: FileList | null }} = {};
          data.data.forEach((assignment: Assignment) => {
            if (!assignment.submission) {
              initialSubmissionData[assignment.id] = { text: '', files: null };
            }
          });
          setSubmissionData(initialSubmissionData);
        } else {
          toast.error(data.message || 'Failed to fetch assignments');
        }
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || 'Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/student-services/assignments/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data: ApiResponse<AssignmentStats> = await response.json();
        if (data.success && data.data) {
          setStats(data.data);
        } else {
          toast.error(data.message || 'Failed to fetch assignment statistics');
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching assignment stats:', error);
      toast.error('Failed to fetch assignment statistics');
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    const submission = submissionData[assignmentId];
    if (!submission || (!submission.text && !submission.files)) {
      toast.error('Please provide either text submission or upload files');
      return;
    }

    try {
      setSubmitting(assignmentId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const formData = new FormData();
      if (submission.text) {
        formData.append('submissionText', submission.text);
      }
      
      if (submission.files) {
        for (let i = 0; i < submission.files.length; i++) {
          formData.append('files', submission.files[i]);
        }
      }

      const response = await fetch(`/api/student-services/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        toast.success('Assignment submitted successfully');
        fetchAssignments(); // Refresh assignments
        fetchStats(); // Refresh stats
        
        // Clear submission data
        setSubmissionData(prev => {
          const newData = { ...prev };
          delete newData[assignmentId];
          return newData;
        });
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit assignment');
      }
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Error submitting assignment');
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusColor = (assignment: Assignment) => {
    if (assignment.submission) {
      if (assignment.submission.marksObtained !== undefined && assignment.submission.marksObtained !== null) {
        return 'default'; // Graded
      } else {
        return 'secondary'; // Submitted, not graded
      }
    } else {
      // Use backend-provided isOverdue flag
      if (assignment.isOverdue) {
        return 'destructive'; // Overdue
      } else {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        if (isBefore(dueDate, new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000))) {
          return 'warning'; // Due soon
        } else {
          return 'outline'; // Pending
        }
      }
    }
  };

  const getStatusText = (assignment: Assignment) => {
    if (assignment.submission) {
      if (assignment.submission.marksObtained !== undefined && assignment.submission.marksObtained !== null) {
        return `Graded (${assignment.submission.marksObtained}/${assignment.maxMarks})`;
      } else {
        return assignment.submission.isLateSubmission ? 'Submitted (Late)' : 'Submitted';
      }
    } else {
      // Use backend-provided isOverdue flag
      if (assignment.isOverdue) {
        return 'Overdue';
      } else {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        if (isBefore(dueDate, new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000))) {
          return 'Due Soon';
        } else {
          return 'Pending';
        }
      }
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.section.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.faculty.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const submittedAssignments = filteredAssignments.filter(a => a.submission);
  const pendingAssignments = filteredAssignments.filter(a => !a.submission);
  const gradedAssignments = filteredAssignments.filter(a => a.submission && a.submission.marksObtained !== undefined && a.submission.marksObtained !== null);

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1">
              {assignment.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {assignment.section.code} - {assignment.section.name}
              </span>
              <span className="text-xs">
                Faculty: {assignment.faculty.user.name}
              </span>
              <Badge variant="outline">
                {assignment.assignmentType}
              </Badge>
            </div>
          </div>
          <Badge variant={getStatusColor(assignment) as any}>
            {getStatusText(assignment)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assignment.description}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
              </span>
              <span>Max: {assignment.maxMarks} marks</span>
            </div>
          </div>

          {assignment.instructions && (
            <div className="bg-blue-50 p-3 rounded text-sm">
              <strong>Instructions:</strong> {assignment.instructions}
            </div>
          )}

          {assignment.submission ? (
            // Show submission details
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Submitted on {format(new Date(assignment.submission.submissionDate), 'MMM dd, yyyy HH:mm')}
                </span>
                {assignment.submission.isLateSubmission && (
                  <Badge variant="destructive" className="text-xs">Late</Badge>
                )}
              </div>
              
              {assignment.submission.submissionText && (
                <p className="text-sm text-green-700 mb-2">
                  <strong>Text:</strong> {assignment.submission.submissionText}
                </p>
              )}

              {assignment.submission.fileUrls && assignment.submission.fileUrls.length > 0 && (
                <div className="mb-2">
                  <strong className="text-sm text-green-800">Files:</strong>
                  <div className="space-y-1 mt-1">
                    {assignment.submission.fileUrls.map((fileUrl, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <File className="h-4 w-4" />
                        <span>{fileUrl.split('/').pop()}</span>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {assignment.submission.marksObtained !== undefined && assignment.submission.marksObtained !== null && (
                <div className="bg-white p-3 rounded border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">
                      Grade: {assignment.submission.marksObtained}/{assignment.maxMarks}
                    </span>
                  </div>
                  {assignment.submission.feedback && (
                    <p className="text-sm text-gray-700">
                      <strong>Feedback:</strong> {assignment.submission.feedback}
                    </p>
                  )}
                  {assignment.submission.gradedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Graded on {format(new Date(assignment.submission.gradedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            // Show submission form
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Submit Assignment
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Text Submission (Optional)</label>
                  <Textarea
                    value={submissionData[assignment.id]?.text || ''}
                    onChange={(e) => setSubmissionData(prev => ({
                      ...prev,
                      [assignment.id]: {
                        ...prev[assignment.id],
                        text: e.target.value
                      }
                    }))}
                    placeholder="Enter your submission text here..."
                    className="mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Upload Files (Optional)</label>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => setSubmissionData(prev => ({
                      ...prev,
                      [assignment.id]: {
                        ...prev[assignment.id],
                        files: e.target.files
                      }
                    }))}
                    className="mt-1"
                    accept={assignment.submissionFormat.map(format => `.${format}`).join(',')}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Accepted formats: {assignment.submissionFormat.join(', ')}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => handleSubmitAssignment(assignment.id)}
                    disabled={submitting === assignment.id}
                    size="sm"
                  >
                    {submitting === assignment.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Assignment
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Assignments</h1>
          <p className="text-muted-foreground">
            View and submit your course assignments
          </p>
        </div>
        <Button
          onClick={() => {
            fetchAssignments();
            fetchStats();
          }}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Assignments</p>
                  <p className="text-2xl font-bold">{stats.totalAssignments}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                  <p className="text-2xl font-bold text-green-600">{stats.submittedCount}</p>
                  <p className="text-xs text-muted-foreground">{stats.submissionRate}% submission rate</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.pendingAssignments}</p>
                  {stats.overdueAssignments > 0 && (
                    <p className="text-xs text-red-600">{stats.overdueAssignments} overdue</p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.averageScore}%</p>
                  <p className="text-xs text-muted-foreground">{stats.gradedCount} graded</p>
                </div>
                <Star className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignments Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Assignments ({filteredAssignments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
          <TabsTrigger value="submitted">Submitted ({submittedAssignments.length})</TabsTrigger>
          <TabsTrigger value="graded">Graded ({gradedAssignments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No assignments found.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {pendingAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {submittedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {gradedAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
