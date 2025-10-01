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
import { getCurrentUser } from "@/lib/auth";
import { 
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Award,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  User
} from "lucide-react";

interface Department {
  id: string;
  name: string;
  code: string;
  head: string;
  headEmail: string;
  headPhone: string;
  location: string;
  establishedYear: string;
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  budget: number;
  status: 'active' | 'inactive';
  description: string;
}

export default function DepartmentManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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

  const departments: Department[] = [
    {
      id: "1",
      name: "Computer Science & Engineering",
      code: "CSE",
      head: "Dr. Rajesh Kumar",
      headEmail: "rajesh.kumar@yukti.edu.in",
      headPhone: "+91 98765 43210",
      location: "Block A, 3rd Floor",
      establishedYear: "1985",
      totalStudents: 320,
      totalFaculty: 18,
      totalCourses: 45,
      budget: 5000000,
      status: "active",
      description: "Focuses on software engineering, AI, data science, and computer systems."
    },
    {
      id: "2",
      name: "Electronics & Communication",
      code: "ECE",
      head: "Dr. Priya Sharma",
      headEmail: "priya.sharma@yukti.edu.in",
      headPhone: "+91 98765 43211",
      location: "Block B, 2nd Floor",
      establishedYear: "1987",
      totalStudents: 280,
      totalFaculty: 15,
      totalCourses: 38,
      budget: 4200000,
      status: "active",
      description: "Specializes in electronics, telecommunications, and embedded systems."
    },
    {
      id: "3",
      name: "Mechanical Engineering",
      code: "MECH",
      head: "Dr. Amit Singh",
      headEmail: "amit.singh@yukti.edu.in",
      headPhone: "+91 98765 43212",
      location: "Block C, 1st Floor",
      establishedYear: "1986",
      totalStudents: 350,
      totalFaculty: 20,
      totalCourses: 42,
      budget: 6000000,
      status: "active",
      description: "Covers automotive, manufacturing, thermal, and mechanical systems."
    },
    {
      id: "4",
      name: "Civil Engineering",
      code: "CIVIL",
      head: "Dr. Sunita Patel",
      headEmail: "sunita.patel@yukti.edu.in",
      headPhone: "+91 98765 43213",
      location: "Block D, Ground Floor",
      establishedYear: "1985",
      totalStudents: 300,
      totalFaculty: 16,
      totalCourses: 35,
      budget: 4800000,
      status: "active",
      description: "Infrastructure development, construction technology, and urban planning."
    },
    {
      id: "5",
      name: "Biotechnology",
      code: "BIOTECH",
      head: "Dr. Rahul Verma",
      headEmail: "rahul.verma@yukti.edu.in",
      headPhone: "+91 98765 43214",
      location: "Block E, 2nd Floor",
      establishedYear: "2005",
      totalStudents: 150,
      totalFaculty: 12,
      totalCourses: 28,
      budget: 3500000,
      status: "active",
      description: "Biotechnology research, genetic engineering, and pharmaceutical sciences."
    }
  ];

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Department Management" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Department Management</h2>
            <p className="text-muted-foreground">Manage academic departments and their information</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Departments</p>
                  <p className="text-2xl font-bold">{departments.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.totalStudents, 0)}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Faculty</p>
                  <p className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + dept.totalFaculty, 0)}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold">₹{(departments.reduce((sum, dept) => sum + dept.budget, 0) / 10000000).toFixed(1)}Cr</p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Department Details</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search departments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Department Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepartments.map((department) => (
                <Card key={department.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{department.name}</CardTitle>
                        <CardDescription>({department.code})</CardDescription>
                      </div>
                      <Badge className={department.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {department.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Head Information */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Head: {department.head}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{department.location}</span>
                      </div>

                      {/* Statistics */}
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-blue-600">{department.totalStudents}</p>
                          <p className="text-xs text-gray-500">Students</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{department.totalFaculty}</p>
                          <p className="text-xs text-gray-500">Faculty</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600">{department.totalCourses}</p>
                          <p className="text-xs text-gray-500">Courses</p>
                        </div>
                      </div>

                      {/* Budget */}
                      <div className="text-center pt-2 border-t">
                        <p className="text-sm text-gray-600">Annual Budget</p>
                        <p className="text-lg font-bold text-orange-600">₹{(department.budget / 100000).toFixed(1)}L</p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Department Details</CardTitle>
                <CardDescription>Detailed information about all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {filteredDepartments.map((department) => (
                    <Card key={department.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">{department.name} ({department.code})</h3>
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="font-medium">{department.head}</p>
                                  <p className="text-sm text-gray-600">Department Head</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{department.headEmail}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{department.headPhone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{department.location}</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-4">Statistics & Info</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Established</span>
                                <span className="text-sm font-medium">{department.establishedYear}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Students</span>
                                <span className="text-sm font-medium">{department.totalStudents}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Faculty Members</span>
                                <span className="text-sm font-medium">{department.totalFaculty}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Courses Offered</span>
                                <span className="text-sm font-medium">{department.totalCourses}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Annual Budget</span>
                                <span className="text-sm font-medium">₹{(department.budget / 100000).toFixed(1)}L</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <p className="text-sm text-gray-600">{department.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-6 pt-4 border-t">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Details
                          </Button>
                          <Button variant="outline" size="sm">
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Courses
                          </Button>
                          <Button variant="outline" size="sm">
                            <Users className="h-4 w-4 mr-2" />
                            Manage Faculty
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Department Performance Analytics
                </CardTitle>
                <CardDescription>Key performance indicators by department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">{dept.name}</h3>
                        <Badge variant="outline">{dept.code}</Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{(dept.totalStudents / dept.totalFaculty).toFixed(1)}</p>
                          <p className="text-sm text-gray-600">Student-Faculty Ratio</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">₹{(dept.budget / dept.totalStudents / 1000).toFixed(0)}K</p>
                          <p className="text-sm text-gray-600">Budget per Student</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{(dept.totalCourses / dept.totalFaculty).toFixed(1)}</p>
                          <p className="text-sm text-gray-600">Courses per Faculty</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{Math.floor(Math.random() * 30) + 70}%</p>
                          <p className="text-sm text-gray-600">Utilization Rate</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Budget Allocation */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation</CardTitle>
                <CardDescription>Department-wise budget distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => {
                    const totalBudget = departments.reduce((sum, d) => sum + d.budget, 0);
                    const percentage = ((dept.budget / totalBudget) * 100).toFixed(1);
                    return (
                      <div key={dept.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{dept.name}</span>
                          <span className="text-sm text-gray-600">₹{(dept.budget / 100000).toFixed(1)}L ({percentage}%)</span>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
