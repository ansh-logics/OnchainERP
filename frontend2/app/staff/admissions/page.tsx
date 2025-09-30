"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { 
  Search,
  FileText, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Download
} from "lucide-react";

export default function StaffAdmissionsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("pending");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'staff') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock applications data
  const applications = [
    {
      id: '1',
      name: 'Rahul Kumar Singh',
      email: 'rahul.kumar@email.com',
      phone: '+91 9876543210',
      course: 'B.Tech Computer Science',
      applicationDate: '2024-03-15',
      status: 'pending',
      documents: ['10th Certificate', '12th Certificate', 'Identity Proof', 'Photos'],
      scores: { physics: 85, chemistry: 92, mathematics: 88 }
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543211',
      course: 'B.Tech Electronics',
      applicationDate: '2024-03-14',
      status: 'under_review',
      documents: ['10th Certificate', '12th Certificate', 'Identity Proof'],
      scores: { physics: 90, chemistry: 85, mathematics: 92 }
    },
    {
      id: '3',
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 9876543212',
      course: 'B.Tech Mechanical',
      applicationDate: '2024-03-13',
      status: 'approved',
      documents: ['10th Certificate', '12th Certificate', 'Identity Proof', 'Photos'],
      scores: { physics: 88, chemistry: 90, mathematics: 94 }
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      phone: '+91 9876543213',
      course: 'B.Tech Civil',
      applicationDate: '2024-03-12',
      status: 'rejected',
      documents: ['10th Certificate', '12th Certificate'],
      scores: { physics: 70, chemistry: 68, mathematics: 72 }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app => 
    selectedTab === 'all' ? true : app.status === selectedTab
  ).filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    under_review: applications.filter(app => app.status === 'under_review').length,
    approved: applications.filter(app => app.status === 'approved').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <DashboardLayout title="Admissions Management" userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Admission Applications</h2>
            <p className="text-gray-600">Review and manage student admission applications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Application
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-gray-600">Total Applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-sm text-gray-600">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.under_review}</div>
              <p className="text-sm text-gray-600">Under Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-sm text-gray-600">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-sm text-gray-600">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="under_review">Under Review</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getStatusIcon(application.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{application.name}</h3>
                            <p className="text-sm text-gray-600">{application.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(application.status)}>
                            {application.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Course:</span> {application.course}
                        </div>
                        <div>
                          <span className="font-medium">Applied:</span> {new Date(application.applicationDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Phone:</span> {application.phone}
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                        <div className="p-2 bg-blue-50 rounded">
                          <span className="font-medium">Physics:</span> {application.scores.physics}%
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <span className="font-medium">Chemistry:</span> {application.scores.chemistry}%
                        </div>
                        <div className="p-2 bg-purple-50 rounded">
                          <span className="font-medium">Mathematics:</span> {application.scores.mathematics}%
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex gap-2">
                          {application.documents.map((doc, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                        
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {filteredApplications.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No applications found matching your criteria.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
