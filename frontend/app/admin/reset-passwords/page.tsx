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
  RefreshCw,
  Search,
  Filter,
  Mail,
  Phone,
  Eye,
  Download,
  Upload,
  Users,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Send,
  Key,
  Lock,
  Unlock,
  FileText,
  Calendar
} from "lucide-react";

interface PasswordResetRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  department: string;
  requestType: 'self' | 'admin' | 'bulk';
  requestDate: string;
  status: 'pending' | 'sent' | 'completed' | 'expired';
  resetToken?: string;
  expiryDate?: string;
  resetDate?: string;
  reason: string;
}

interface UserForReset {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  lastLogin: string;
  status: 'active' | 'inactive' | 'locked';
  passwordLastChanged: string;
}

export default function ResetPasswordsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
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

  const resetRequests: PasswordResetRequest[] = [
    {
      id: "1",
      userId: "u123",
      userName: "Rahul Sharma",
      userEmail: "rahul.sharma@yukti.edu.in",
      userRole: "Student",
      department: "Computer Science",
      requestType: "self",
      requestDate: "2024-10-01 14:30",
      status: "pending",
      reason: "Forgot password"
    },
    {
      id: "2",
      userId: "u124",
      userName: "Dr. Priya Patel",
      userEmail: "priya.patel@yukti.edu.in",
      userRole: "Faculty",
      department: "Electronics",
      requestType: "admin",
      requestDate: "2024-09-30 11:15",
      status: "sent",
      resetToken: "abc123xyz",
      expiryDate: "2024-10-02 11:15",
      reason: "Account locked - multiple failed attempts"
    },
    {
      id: "3",
      userId: "u125",
      userName: "Amit Singh",
      userEmail: "amit.singh@yukti.edu.in",
      userRole: "Staff",
      department: "Administration",
      requestType: "bulk",
      requestDate: "2024-09-28 09:00",
      status: "completed",
      resetDate: "2024-09-28 10:30",
      reason: "Bulk password reset for security"
    }
  ];

  const users: UserForReset[] = [
    {
      id: "u123",
      name: "Rahul Sharma",
      email: "rahul.sharma@yukti.edu.in",
      phone: "+91 98765 43210",
      role: "Student",
      department: "Computer Science",
      lastLogin: "2024-09-25 16:45",
      status: "active",
      passwordLastChanged: "2024-07-15 10:30"
    },
    {
      id: "u124",
      name: "Dr. Priya Patel",
      email: "priya.patel@yukti.edu.in",
      phone: "+91 98765 43211",
      role: "Faculty",
      department: "Electronics",
      lastLogin: "2024-09-29 14:20",
      status: "locked",
      passwordLastChanged: "2024-06-10 09:15"
    },
    {
      id: "u125",
      name: "Amit Singh",
      email: "amit.singh@yukti.edu.in",
      phone: "+91 98765 43212",
      role: "Staff",
      department: "Administration",
      lastLogin: "2024-10-01 08:30",
      status: "active",
      passwordLastChanged: "2024-09-28 10:30"
    },
    {
      id: "u126",
      name: "Sarah Johnson",
      email: "sarah.johnson@yukti.edu.in",
      phone: "+91 98765 43213",
      role: "Faculty",
      department: "Mechanical",
      lastLogin: "2024-08-15 12:00",
      status: "inactive",
      passwordLastChanged: "2024-05-01 14:20"
    }
  ];

  const filteredUsers = users.filter(u => 
    (selectedRole === "all" || u.role.toLowerCase() === selectedRole) &&
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'locked': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return AlertCircle;
      case 'sent': return Send;
      case 'completed': return CheckCircle;
      case 'expired': return XCircle;
      case 'active': return CheckCircle;
      case 'inactive': return XCircle;
      case 'locked': return Lock;
      default: return AlertCircle;
    }
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const isPasswordOld = (passwordDate: string) => {
    const daysDiff = Math.floor((Date.now() - new Date(passwordDate).getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff > 90; // Consider password old if older than 90 days
  };

  return (
    <DashboardLayout title="Reset Passwords" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Password Reset Management</h2>
            <p className="text-muted-foreground">Manage password reset requests and initiate bulk resets</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <RefreshCw className="h-4 w-4 mr-2" />
              Bulk Reset
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold">{resetRequests.filter(r => r.status === 'pending').length}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Locked Accounts</p>
                  <p className="text-2xl font-bold">{users.filter(u => u.status === 'locked').length}</p>
                </div>
                <Lock className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Old Passwords</p>
                  <p className="text-2xl font-bold">{users.filter(u => isPasswordOld(u.passwordLastChanged)).length}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold">{resetRequests.length}</p>
                </div>
                <RefreshCw className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requests">Reset Requests</TabsTrigger>
            <TabsTrigger value="users">User Accounts</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Password Reset Requests
                </CardTitle>
                <CardDescription>Manage pending and completed password reset requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resetRequests.map((request) => {
                    const StatusIcon = getStatusIcon(request.status);
                    
                    return (
                      <Card key={request.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-gray-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{request.userName}</h3>
                                <p className="text-sm text-gray-600">{request.userEmail}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline">{request.userRole}</Badge>
                                  <Badge variant="outline">{request.department}</Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(request.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {request.status}
                              </Badge>
                              <p className="text-sm text-gray-600 mt-1">{request.requestDate}</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Request Type: </span>
                                <Badge variant="outline" className="capitalize">{request.requestType}</Badge>
                              </div>
                              <div>
                                <span className="font-medium">Reason: </span>
                                <span className="text-gray-600">{request.reason}</span>
                              </div>
                              {request.expiryDate && (
                                <div>
                                  <span className="font-medium">Expires: </span>
                                  <span className="text-gray-600">{request.expiryDate}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button size="sm">
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Reset Link
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Key className="h-4 w-4 mr-2" />
                                  Generate Password
                                </Button>
                              </>
                            )}
                            {request.status === 'sent' && (
                              <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-2" />
                                Resend Link
                              </Button>
                            )}
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-blue-800">
                      {selectedUsers.length} user(s) selected
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset Selected
                      </Button>
                      <Button size="sm" variant="outline">
                        <Unlock className="h-4 w-4 mr-2" />
                        Unlock Selected
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedUsers([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((userAccount) => {
                const StatusIcon = getStatusIcon(userAccount.status);
                const passwordAge = Math.floor((Date.now() - new Date(userAccount.passwordLastChanged).getTime()) / (1000 * 60 * 60 * 24));
                const isSelected = selectedUsers.includes(userAccount.id);
                
                return (
                  <Card key={userAccount.id} className={`hover:shadow-lg transition-shadow ${isSelected ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleUserSelection(userAccount.id)}
                            className="rounded"
                          />
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{userAccount.name}</h3>
                            <p className="text-sm text-gray-600">{userAccount.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{userAccount.role}</Badge>
                              <Badge variant="outline">{userAccount.department}</Badge>
                              <Badge className={getStatusColor(userAccount.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {userAccount.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                            <div>
                              <p className="text-gray-600">Last Login</p>
                              <p className="font-medium">{userAccount.lastLogin}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Password Age</p>
                              <p className={`font-medium ${passwordAge > 90 ? 'text-red-600' : passwordAge > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                                {passwordAge} days
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reset Password
                            </Button>
                            {userAccount.status === 'locked' ? (
                              <Button variant="outline" size="sm">
                                <Unlock className="h-4 w-4 mr-2" />
                                Unlock
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm">
                                <Lock className="h-4 w-4 mr-2" />
                                Lock
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {passwordAge > 90 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <p className="text-sm text-red-800 font-medium">Password Expired</p>
                          </div>
                          <p className="text-sm text-red-700 mt-1">This user's password is older than 90 days and should be reset for security.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bulk Password Operations</CardTitle>
                <CardDescription>Perform password operations on multiple users at once</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <RefreshCw className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                      <h3 className="font-semibold mb-2">Bulk Password Reset</h3>
                      <p className="text-sm text-gray-600 mb-4">Reset passwords for multiple users and send new credentials</p>
                      <Button className="w-full">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Start Bulk Reset
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Upload className="h-12 w-12 mx-auto text-green-600 mb-4" />
                      <h3 className="font-semibold mb-2">Import Reset List</h3>
                      <p className="text-sm text-gray-600 mb-4">Upload CSV file with users who need password reset</p>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload CSV
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                      <h3 className="font-semibold mb-2">Scheduled Reset</h3>
                      <p className="text-sm text-gray-600 mb-4">Schedule password expiry and automatic reset reminders</p>
                      <Button variant="outline" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Reset
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Shield className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                      <h3 className="font-semibold mb-2">Security Policy</h3>
                      <p className="text-sm text-gray-600 mb-4">Configure password policies and expiry rules</p>
                      <Button variant="outline" className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Manage Policies
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Password Policy Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Password Expiry (Days)</Label>
                        <Input type="number" defaultValue="90" />
                      </div>
                      <div className="space-y-2">
                        <Label>Minimum Password Length</Label>
                        <Input type="number" defaultValue="8" />
                      </div>
                      <div className="space-y-2">
                        <Label>Failed Attempts Before Lock</Label>
                        <Input type="number" defaultValue="5" />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Lock Duration (Hours)</Label>
                        <Input type="number" defaultValue="24" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Password Requirements</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <label className="text-sm">Uppercase letters</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <label className="text-sm">Lowercase letters</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <label className="text-sm">Numbers</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked className="rounded" />
                          <label className="text-sm">Special characters</label>
                        </div>
                      </div>
                    </div>

                    <Button>
                      <Shield className="h-4 w-4 mr-2" />
                      Update Policy
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
