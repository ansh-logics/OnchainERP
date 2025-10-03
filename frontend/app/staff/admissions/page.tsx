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
import { getStudents, type StudentData } from "@/lib/api";
import { 
  Search,
  FileText, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  Filter,
  Download,
  AlertCircle,
  RefreshCcw
} from "lucide-react";

export default function StaffAdmissionsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== 'staff' && currentUser.role !== 'faculty')) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadStudents();
  }, [router]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getStudents({});
      
      if (response.success && response.data) {
        setStudents(response.data);
      } else {
        setError(response.message || 'Failed to load students');
      }
    } catch (err) {
      console.error('Error loading students:', err);
      setError('An error occurred while loading students');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.enrollmentNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'enrolled') return matchesSearch && student.admissionStatus === 'enrolled';
    if (selectedTab === 'pending') return matchesSearch && student.admissionStatus === 'pending';
    if (selectedTab === 'graduated') return matchesSearch && student.admissionStatus === 'graduated';
    
    return matchesSearch;
  });

  const stats = {
    all: students.length,
    enrolled: students.filter(s => s.admissionStatus === 'enrolled').length,
    pending: students.filter(s => s.admissionStatus === 'pending').length,
    graduated: students.filter(s => s.admissionStatus === 'graduated').length,
  };

  return (
    <DashboardLayout title="Admissions Management" userRole={(user.role === 'faculty' ? 'faculty' : 'staff') as 'faculty'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Student Admissions</h2>
            <p className="text-gray-600">Manage student enrollment and admissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadStudents}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadStudents}
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab('all')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
                <UserPlus className="h-4 w-4 text-gray-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.all}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab('enrolled')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-600">Enrolled</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.enrolled}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab('pending')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-orange-600">Pending</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedTab('graduated')}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-600">Graduated</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.graduated}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name or enrollment number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <CardHeader>
              <TabsList>
                <TabsTrigger value="all">All ({stats.all})</TabsTrigger>
                <TabsTrigger value="enrolled">Enrolled ({stats.enrolled})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="graduated">Graduated ({stats.graduated})</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading students...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-12 text-center">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students found</p>
                  {searchTerm && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchTerm('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {student.user?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <h3 className="font-semibold">{student.user?.name || 'N/A'}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>{student.enrollmentNumber}</span>
                              <span>•</span>
                              <span>{student.program}</span>
                              <span>•</span>
                              <span>Batch {student.batch}</span>
                              <span>•</span>
                              <span>Sem {student.currentSemester}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={
                          student.admissionStatus === 'enrolled' ? 'default' :
                          student.admissionStatus === 'pending' ? 'secondary' :
                          student.admissionStatus === 'graduated' ? 'outline' : 'destructive'
                        }>
                          {student.admissionStatus}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </DashboardLayout>
  );
}
