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
  GraduationCap,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  FileText,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  BarChart3
} from "lucide-react";

interface AdmissionApplication {
  id: string;
  applicationNumber: string;
  applicantName: string;
  email: string;
  phone: string;
  course: string;
  department: string;
  category: string;
  applicationDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'waitlisted' | 'enrolled';
  documents: string[];
  entrance_score?: number;
  interview_score?: number;
  total_marks: number;
  rank?: number;
  fee_paid: boolean;
  remarks?: string;
}

export default function AdmissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
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

  const applications: AdmissionApplication[] = [
    {
      id: "1",
      applicationNumber: "YU2024001",
      applicantName: "Arjun Sharma",
      email: "arjun.sharma@email.com",
      phone: "+91 98765 43210",
      course: "B.Tech",
      department: "Computer Science",
      category: "General",
      applicationDate: "2024-05-15",
      status: "approved",
      documents: ["10th Certificate", "12th Certificate", "JEE Score", "Photo", "Signature"],
      entrance_score: 85,
      interview_score: 78,
      total_marks: 81.5,
      rank: 45,
      fee_paid: true
    },
    {
      id: "2",
      applicationNumber: "YU2024002", 
      applicantName: "Priya Patel",
      email: "priya.patel@email.com",
      phone: "+91 98765 43211",
      course: "B.Tech",
      department: "Electronics",
      category: "OBC",
      applicationDate: "2024-05-16",
      status: "under_review",
      documents: ["10th Certificate", "12th Certificate", "JEE Score", "Photo", "Caste Certificate"],
      entrance_score: 78,
      total_marks: 78,
      rank: 67,
      fee_paid: false
    },
    {
      id: "3",
      applicationNumber: "YU2024003",
      applicantName: "Rahul Singh",
      email: "rahul.singh@email.com", 
      phone: "+91 98765 43212",
      course: "MBA",
      department: "Management",
      category: "General",
      applicationDate: "2024-05-17",
      status: "waitlisted",
      documents: ["Graduation Certificate", "CAT Score", "Work Experience", "Photo"],
      entrance_score: 72,
      interview_score: 85,
      total_marks: 78.5,
      rank: 125,
      fee_paid: false
    },
    {
      id: "4",
      applicationNumber: "YU2024004",
      applicantName: "Sneha Gupta",
      email: "sneha.gupta@email.com",
      phone: "+91 98765 43213", 
      course: "M.Tech",
      department: "Computer Science",
      category: "SC",
      applicationDate: "2024-05-18",
      status: "pending",
      documents: ["B.Tech Certificate", "GATE Score", "Photo"],
      entrance_score: 68,
      total_marks: 68,
      fee_paid: false,
      remarks: "Incomplete documents"
    }
  ];

  const courses = ["All Courses", "B.Tech", "M.Tech", "MBA", "BBA", "BCA"];
  
  const filteredApplications = applications.filter(app =>
    (selectedStatus === "all" || app.status === selectedStatus) &&
    (selectedCourse === "all" || selectedCourse === "All Courses" || app.course === selectedCourse) &&
    (app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     app.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'waitlisted': return 'bg-orange-100 text-orange-800';
      case 'enrolled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'under_review': return AlertCircle;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'waitlisted': return Clock;
      case 'enrolled': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const admissionStats = {
    totalApplications: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    underReview: applications.filter(a => a.status === 'under_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    enrolled: applications.filter(a => a.status === 'enrolled').length
  };

  return (
    <DashboardLayout title="Admissions Management" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Admissions Management</h2>
            <p className="text-muted-foreground">Manage student applications and admission process</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Application
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{admissionStats.totalApplications}</p>
                <p className="text-sm text-gray-600">Total Applications</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{admissionStats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{admissionStats.underReview}</p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{admissionStats.approved}</p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{admissionStats.rejected}</p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{admissionStats.enrolled}</p>
                <p className="text-sm text-gray-600">Enrolled</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="review">Review Process</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                      <SelectItem value="enrolled">Enrolled</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Applications List */}
            <div className="space-y-4">
              {filteredApplications.map((application) => {
                const StatusIcon = getStatusIcon(application.status);
                
                return (
                  <Card key={application.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{application.applicantName}</h3>
                            <p className="text-sm text-gray-600">Application #{application.applicationNumber}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{application.course}</Badge>
                              <Badge variant="outline">{application.department}</Badge>
                              <Badge variant="outline">{application.category}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(application.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {application.status.replace('_', ' ')}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">Applied: {application.applicationDate}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{application.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{application.phone}</span>
                        </div>
                        {application.rank && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">Rank: {application.rank}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Score: {application.total_marks}%</span>
                        </div>
                      </div>

                      {/* Documents Status */}
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Documents ({application.documents.length}):</p>
                        <div className="flex flex-wrap gap-1">
                          {application.documents.map((doc, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Scores */}
                      {(application.entrance_score || application.interview_score) && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                          {application.entrance_score && (
                            <div className="text-center">
                              <p className="text-lg font-bold text-blue-600">{application.entrance_score}%</p>
                              <p className="text-xs text-gray-600">Entrance</p>
                            </div>
                          )}
                          {application.interview_score && (
                            <div className="text-center">
                              <p className="text-lg font-bold text-green-600">{application.interview_score}%</p>
                              <p className="text-xs text-gray-600">Interview</p>
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-lg font-bold text-purple-600">{application.total_marks}%</p>
                            <p className="text-xs text-gray-600">Total</p>
                          </div>
                        </div>
                      )}

                      {/* Fee Payment Status */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Fee Payment:</span>
                          <Badge className={application.fee_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {application.fee_paid ? 'Paid' : 'Pending'}
                          </Badge>
                        </div>
                        {application.remarks && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Remarks:</span> {application.remarks}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {application.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        {application.status === 'approved' && !application.fee_paid && (
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Fee Notice
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

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Process Workflow</CardTitle>
                <CardDescription>Configure admission review stages and criteria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Review Stages */}
                  <div>
                    <h3 className="font-semibold mb-4">Review Stages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { stage: "Document Verification", status: "active", count: 12 },
                        { stage: "Entrance Exam", status: "active", count: 8 },
                        { stage: "Interview", status: "pending", count: 15 },
                        { stage: "Final Selection", status: "completed", count: 25 }
                      ].map((stage, index) => (
                        <Card key={index} className={`border-l-4 ${
                          stage.status === 'active' ? 'border-l-blue-500' :
                          stage.status === 'pending' ? 'border-l-yellow-500' :
                          'border-l-green-500'
                        }`}>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-sm">{stage.stage}</h4>
                            <p className="text-2xl font-bold mt-2">{stage.count}</p>
                            <p className="text-xs text-gray-600">Applications</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Evaluation Criteria */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Evaluation Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-3">B.Tech Programs</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">JEE Main Score</span>
                              <span className="text-sm font-medium">50%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">12th Grade Marks</span>
                              <span className="text-sm font-medium">30%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Interview</span>
                              <span className="text-sm font-medium">20%</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-3">MBA Program</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">CAT/MAT Score</span>
                              <span className="text-sm font-medium">40%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Work Experience</span>
                              <span className="text-sm font-medium">25%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">Interview</span>
                              <span className="text-sm font-medium">35%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <div className="flex gap-4">
                    <Button>Schedule Interviews</Button>
                    <Button variant="outline">Generate Merit List</Button>
                    <Button variant="outline">Send Notifications</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Application Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courses.slice(1).map((course) => {
                      const courseApps = applications.filter(a => a.course === course).length;
                      const percentage = (courseApps / applications.length) * 100;
                      return (
                        <div key={course}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{course}</span>
                            <span>{courseApps} ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
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
                  <CardTitle>Selection Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {Math.round((admissionStats.approved / admissionStats.totalApplications) * 100)}%
                        </p>
                        <p className="text-sm text-green-700">Approval Rate</p>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">
                          {Math.round((admissionStats.rejected / admissionStats.totalApplications) * 100)}%
                        </p>
                        <p className="text-sm text-red-700">Rejection Rate</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Average Scores</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Entrance Exam</span>
                          <span className="text-sm font-medium">75.8%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Interview</span>
                          <span className="text-sm font-medium">81.5%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Overall</span>
                          <span className="text-sm font-medium">78.2%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Admission Settings</CardTitle>
                <CardDescription>Configure admission process parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Application Start Date</Label>
                      <Input type="date" defaultValue="2024-03-01" />
                    </div>
                    <div className="space-y-2">
                      <Label>Application End Date</Label>
                      <Input type="date" defaultValue="2024-06-30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Entrance Exam Date</Label>
                      <Input type="date" defaultValue="2024-07-15" />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Application Fee (₹)</Label>
                      <Input type="number" defaultValue="1500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Late Fee (₹)</Label>
                      <Input type="number" defaultValue="500" />
                    </div>
                    <div className="space-y-2">
                      <Label>Minimum Qualification (%)</Label>
                      <Input type="number" defaultValue="60" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Required Documents</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {["10th Certificate", "12th Certificate", "Entrance Score", "Photo", "Signature", "Caste Certificate", "Income Certificate"].map((doc) => (
                      <div key={doc} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <label className="text-sm">{doc}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
