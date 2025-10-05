"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  X,
  User,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Submission {
  id: string;
  student: {
    id: string;
    rollNumber: string;
    enrollmentNumber: string;
    user: {
      name: string;
      email: string;
    };
  };
  submissionDate: string;
  isLateSubmission: boolean;
  submissionText: string;
  fileUrls: string[];
  marksObtained?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: {
    user: {
      name: string;
    };
  };
}

interface Assignment {
  id: string;
  title: string;
  maxMarks: number;
  dueDate: string;
  course: {
    name: string;
    code: string;
  };
}

interface ViewSubmissionsProps {
  assignmentId: string;
  onClose: () => void;
}

export default function ViewSubmissions({ assignmentId, onClose }: ViewSubmissionsProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState<string | null>(null);
  const [gradeData, setGradeData] = useState<{[key: string]: { marks: number; feedback: string }}>({});

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      // Fetch assignment details and submissions
      const [assignmentResponse, submissionsResponse] = await Promise.all([
        fetch(`/api/faculty-services/assignments/${assignmentId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`/api/faculty-services/assignments/${assignmentId}/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      if (assignmentResponse.ok && submissionsResponse.ok) {
        const assignmentData = await assignmentResponse.json();
        const submissionsData = await submissionsResponse.json();
        
        setAssignment(assignmentData.data);
        setSubmissions(submissionsData.data || []);

        // Initialize grade data for ungraded submissions
        const initialGradeData: {[key: string]: { marks: number; feedback: string }} = {};
        submissionsData.data?.forEach((submission: Submission) => {
          if (!submission.marksObtained) {
            initialGradeData[submission.id] = { marks: 0, feedback: '' };
          }
        });
        setGradeData(initialGradeData);
      } else {
        toast.error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    const grade = gradeData[submissionId];
    if (!grade || grade.marks < 0 || grade.marks > (assignment?.maxMarks || 100)) {
      toast.error(`Marks must be between 0 and ${assignment?.maxMarks || 100}`);
      return;
    }

    try {
      setGrading(submissionId);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch(`/api/faculty-services/assignments/${assignmentId}/submissions/${submissionId}/grade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          marksObtained: grade.marks,
          feedback: grade.feedback,
        }),
      });

      if (response.ok) {
        toast.success('Submission graded successfully');
        fetchSubmissions(); // Refresh submissions
        
        // Remove from gradeData since it's now graded
        setGradeData(prev => {
          const newData = { ...prev };
          delete newData[submissionId];
          return newData;
        });
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to grade submission');
      }
    } catch (error) {
      console.error('Error grading submission:', error);
      toast.error('Error grading submission');
    } finally {
      setGrading(null);
    }
  };

  const getSubmissionStatusColor = (submission: Submission) => {
    if (submission.marksObtained !== undefined && submission.marksObtained !== null) {
      return 'default'; // Graded
    } else if (submission.isLateSubmission) {
      return 'destructive'; // Late
    } else {
      return 'secondary'; // On time, not graded
    }
  };

  const getSubmissionStatusText = (submission: Submission) => {
    if (submission.marksObtained !== undefined && submission.marksObtained !== null) {
      return 'Graded';
    } else if (submission.isLateSubmission) {
      return 'Late Submission';
    } else {
      return 'Submitted';
    }
  };

  const gradedSubmissions = submissions.filter(s => s.marksObtained !== undefined && s.marksObtained !== null);
  const ungradedSubmissions = submissions.filter(s => s.marksObtained === undefined || s.marksObtained === null);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Submissions: {assignment?.title}
            </h2>
            <p className="text-muted-foreground">
              {assignment?.course.code} - {assignment?.course.name} | Max Marks: {assignment?.maxMarks}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">All Submissions ({submissions.length})</TabsTrigger>
              <TabsTrigger value="graded">Graded ({gradedSubmissions.length})</TabsTrigger>
              <TabsTrigger value="ungraded">Pending ({ungradedSubmissions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {submissions.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No submissions received yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Card key={submission.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {submission.student.user.name}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span>Roll: {submission.student.rollNumber}</span>
                              <span>Enrollment: {submission.student.enrollmentNumber}</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(submission.submissionDate), 'MMM dd, yyyy HH:mm')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getSubmissionStatusColor(submission) as any}>
                              {getSubmissionStatusText(submission)}
                            </Badge>
                            {submission.marksObtained !== undefined && submission.marksObtained !== null && (
                              <Badge variant="outline">
                                {submission.marksObtained}/{assignment?.maxMarks}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {submission.submissionText && (
                            <div>
                              <h4 className="font-medium mb-2">Submission Text:</h4>
                              <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                                {submission.submissionText}
                              </p>
                            </div>
                          )}

                          {submission.fileUrls && submission.fileUrls.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Attached Files:</h4>
                              <div className="space-y-2">
                                {submission.fileUrls.map((fileUrl, index) => (
                                  <div key={index} className="flex items-center gap-2 text-sm">
                                    <FileText className="h-4 w-4" />
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

                          {submission.marksObtained !== undefined && submission.marksObtained !== null ? (
                            // Already graded - show feedback
                            <div className="bg-green-50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="font-medium text-green-800">Graded</span>
                                <Badge variant="outline">{submission.marksObtained}/{assignment?.maxMarks}</Badge>
                              </div>
                              {submission.feedback && (
                                <p className="text-sm text-green-700 mt-2">{submission.feedback}</p>
                              )}
                              {submission.gradedAt && (
                                <p className="text-xs text-green-600 mt-2">
                                  Graded on {format(new Date(submission.gradedAt), 'MMM dd, yyyy HH:mm')}
                                </p>
                              )}
                            </div>
                          ) : (
                            // Not graded - show grading form
                            <div className="bg-blue-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Star className="h-4 w-4" />
                                Grade Submission
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Marks (out of {assignment?.maxMarks})</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={assignment?.maxMarks}
                                    value={gradeData[submission.id]?.marks || 0}
                                    onChange={(e) => setGradeData(prev => ({
                                      ...prev,
                                      [submission.id]: {
                                        ...prev[submission.id],
                                        marks: parseFloat(e.target.value) || 0
                                      }
                                    }))}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="md:col-span-1">
                                  <label className="text-sm font-medium">Feedback (Optional)</label>
                                  <Textarea
                                    value={gradeData[submission.id]?.feedback || ''}
                                    onChange={(e) => setGradeData(prev => ({
                                      ...prev,
                                      [submission.id]: {
                                        ...prev[submission.id],
                                        feedback: e.target.value
                                      }
                                    }))}
                                    placeholder="Provide feedback to the student..."
                                    className="mt-1"
                                    rows={2}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end mt-3">
                                <Button
                                  onClick={() => handleGradeSubmission(submission.id)}
                                  disabled={grading === submission.id}
                                  size="sm"
                                >
                                  {grading === submission.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Grading...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Submit Grade
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="graded" className="space-y-4">
              <div className="space-y-4">
                {gradedSubmissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {submission.student.user.name}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Roll: {submission.student.rollNumber}</span>
                            <span>Grade: {submission.marksObtained}/{assignment?.maxMarks}</span>
                          </div>
                        </div>
                        <Badge variant="default">Graded</Badge>
                      </div>
                    </CardHeader>
                    {submission.feedback && (
                      <CardContent>
                        <div className="bg-green-50 p-3 rounded">
                          <p className="text-sm">{submission.feedback}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Graded on {format(new Date(submission.gradedAt!), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="ungraded" className="space-y-4">
              <div className="space-y-4">
                {ungradedSubmissions.map((submission) => (
                  <Card key={submission.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {submission.student.user.name}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span>Roll: {submission.student.rollNumber}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(submission.submissionDate), 'MMM dd, yyyy HH:mm')}
                            </span>
                          </div>
                        </div>
                        <Badge variant={submission.isLateSubmission ? 'destructive' : 'secondary'}>
                          {submission.isLateSubmission ? 'Late Submission' : 'Pending Grade'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Grade Submission
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Marks (out of {assignment?.maxMarks})</label>
                            <Input
                              type="number"
                              min="0"
                              max={assignment?.maxMarks}
                              value={gradeData[submission.id]?.marks || 0}
                              onChange={(e) => setGradeData(prev => ({
                                ...prev,
                                [submission.id]: {
                                  ...prev[submission.id],
                                  marks: parseFloat(e.target.value) || 0
                                }
                              }))}
                              className="mt-1"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="text-sm font-medium">Feedback (Optional)</label>
                            <Textarea
                              value={gradeData[submission.id]?.feedback || ''}
                              onChange={(e) => setGradeData(prev => ({
                                ...prev,
                                [submission.id]: {
                                  ...prev[submission.id],
                                  feedback: e.target.value
                                }
                              }))}
                              placeholder="Provide feedback to the student..."
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end mt-3">
                          <Button
                            onClick={() => handleGradeSubmission(submission.id)}
                            disabled={grading === submission.id}
                            size="sm"
                          >
                            {grading === submission.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Grading...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Submit Grade
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
