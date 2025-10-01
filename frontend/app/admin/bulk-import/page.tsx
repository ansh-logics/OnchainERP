"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getCurrentUser } from "@/lib/auth";
import { 
  Upload,
  Download,
  FileSpreadsheet,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Play,
  RotateCcw,
  FileText,
  AlertTriangle,
  CheckSquare,
  X
} from "lucide-react";

interface ImportJob {
  id: string;
  fileName: string;
  uploadDate: string;
  recordType: 'students' | 'faculty' | 'staff' | 'departments';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  errors: string[];
}

export default function BulkImportPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
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

  const sampleImportJobs: ImportJob[] = [
    {
      id: "1",
      fileName: "students_2024_batch.csv",
      uploadDate: "2024-10-01 14:30",
      recordType: "students",
      totalRecords: 450,
      processedRecords: 450,
      successfulRecords: 442,
      failedRecords: 8,
      status: "completed",
      errors: ["Invalid phone number format in row 23", "Missing email in row 156"]
    },
    {
      id: "2", 
      fileName: "faculty_new_joiners.csv",
      uploadDate: "2024-09-28 11:15",
      recordType: "faculty",
      totalRecords: 25,
      processedRecords: 15,
      successfulRecords: 15,
      failedRecords: 0,
      status: "processing",
      errors: []
    },
    {
      id: "3",
      fileName: "department_updates.csv",
      uploadDate: "2024-09-25 09:45",
      recordType: "departments", 
      totalRecords: 12,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      status: "pending",
      errors: []
    }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    setSelectedFiles(files);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Play;
      case 'pending': return AlertCircle;
      case 'failed': case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <DashboardLayout title="Bulk Import (CSV)" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Bulk Import (CSV)</h2>
            <p className="text-muted-foreground">Import user data from CSV files in bulk</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Templates
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Import Guide
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Files</TabsTrigger>
            <TabsTrigger value="jobs">Import Jobs</TabsTrigger>
            <TabsTrigger value="templates">Templates & Guides</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            {/* File Upload Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload CSV Files
                </CardTitle>
                <CardDescription>Drag and drop CSV files or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium mb-2">Drop CSV files here</p>
                  <p className="text-gray-600 mb-6">or click to browse from your computer</p>
                  <Button>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: CSV • Maximum file size: 10MB • Maximum records: 10,000
                  </p>
                </div>

                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-3">Selected Files</h3>
                    <div className="space-y-2">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-5 w-5 text-green-600" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Import Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>Import Configuration</CardTitle>
                <CardDescription>Configure import settings before processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Import Type</label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="">Select import type</option>
                        <option value="students">Students</option>
                        <option value="faculty">Faculty</option>
                        <option value="staff">Staff</option>
                        <option value="departments">Departments</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Duplicate Handling</label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="skip">Skip duplicates</option>
                        <option value="update">Update existing records</option>
                        <option value="create_new">Create new records</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Validation Level</label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="strict">Strict (All fields required)</option>
                        <option value="moderate">Moderate (Basic validation)</option>
                        <option value="lenient">Lenient (Minimal validation)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Notification</label>
                      <select className="w-full p-2 border rounded-lg">
                        <option value="email">Email notification</option>
                        <option value="sms">SMS notification</option>
                        <option value="none">No notification</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="validate-only" className="rounded" />
                  <label htmlFor="validate-only" className="text-sm">Validate only (don't import)</label>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Start Import
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            {/* Import Jobs List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Import Jobs History
                </CardTitle>
                <CardDescription>Track the status of your import jobs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleImportJobs.map((job) => {
                    const StatusIcon = getStatusIcon(job.status);
                    const progressPercentage = job.totalRecords > 0 ? (job.processedRecords / job.totalRecords) * 100 : 0;
                    
                    return (
                      <Card key={job.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`h-5 w-5 ${
                                job.status === 'completed' ? 'text-green-600' :
                                job.status === 'processing' ? 'text-blue-600' :
                                job.status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                              }`} />
                              <div>
                                <h3 className="font-semibold">{job.fileName}</h3>
                                <p className="text-sm text-gray-600">Uploaded: {job.uploadDate}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {job.recordType}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-gray-600">Total Records</p>
                              <p className="text-lg font-bold text-blue-600">{job.totalRecords}</p>
                            </div>
                            <div className="text-center p-3 bg-yellow-50 rounded-lg">
                              <p className="text-sm text-gray-600">Processed</p>
                              <p className="text-lg font-bold text-yellow-600">{job.processedRecords}</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 rounded-lg">
                              <p className="text-sm text-gray-600">Successful</p>
                              <p className="text-lg font-bold text-green-600">{job.successfulRecords}</p>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                              <p className="text-sm text-gray-600">Failed</p>
                              <p className="text-lg font-bold text-red-600">{job.failedRecords}</p>
                            </div>
                          </div>

                          {job.status === 'processing' && (
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{progressPercentage.toFixed(1)}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          )}

                          {job.errors.length > 0 && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-red-800">Errors Found</span>
                              </div>
                              <div className="text-sm text-red-700">
                                {job.errors.slice(0, 3).map((error, index) => (
                                  <p key={index}>• {error}</p>
                                ))}
                                {job.errors.length > 3 && (
                                  <p>• And {job.errors.length - 3} more errors...</p>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download Report
                            </Button>
                            {job.status === 'failed' && (
                              <Button variant="outline" size="sm">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Retry
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            {/* CSV Templates */}
            <Card>
              <CardHeader>
                <CardTitle>CSV Templates</CardTitle>
                <CardDescription>Download pre-formatted CSV templates for different data types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { type: 'Students', icon: Users, fields: 'Name, Email, Phone, Department, Year, Roll Number, Address', records: '500+ sample records' },
                    { type: 'Faculty', icon: Users, fields: 'Name, Email, Phone, Department, Designation, Qualification, Experience', records: '50+ sample records' },
                    { type: 'Staff', icon: Users, fields: 'Name, Email, Phone, Department, Position, Employee ID, Join Date', records: '100+ sample records' },
                    { type: 'Departments', icon: Users, fields: 'Name, Code, Head, Description, Established Year, Budget', records: '20+ sample records' }
                  ].map((template) => (
                    <Card key={template.type} className="border-dashed hover:border-solid hover:shadow-lg transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <template.icon className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">{template.type} Template</h3>
                            <p className="text-sm text-gray-600">{template.records}</p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <p className="text-xs text-gray-600 mb-2">Included Fields:</p>
                          <p className="text-sm">{template.fields}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Import Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Import Guidelines</CardTitle>
                <CardDescription>Best practices for successful data imports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-green-600" />
                      Do's
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Use the provided CSV templates
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Ensure all required fields are filled
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Use correct date format (YYYY-MM-DD)
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Validate email addresses and phone numbers
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Keep file size under 10MB
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        Test with a small batch first
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <X className="h-4 w-4 text-red-600" />
                      Don'ts
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        Don't modify column headers
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        Don't include empty rows or columns
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        Don't use special characters in IDs
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        Don't import duplicate records without handling
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        Don't exceed 10,000 records per file
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        Don't import sensitive data without encryption
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
