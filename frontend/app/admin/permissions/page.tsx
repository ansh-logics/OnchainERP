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
  Shield,
  Users,
  Search,
  Filter,
  Edit,
  Save,
  Plus,
  Trash2,
  Eye,
  Lock,
  Unlock,
  CheckSquare,
  Square,
  UserCheck,
  Settings,
  Database,
  FileText,
  CreditCard,
  Building,
  GraduationCap,
  Calendar,
  Mail
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  color: string;
}

interface UserPermission {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'suspended';
  customPermissions: string[];
  lastLogin: string;
}

export default function UserPermissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserPermission | null>(null);
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

  const permissions: Permission[] = [
    // User Management
    { id: "user_create", name: "Create Users", category: "User Management", description: "Create new user accounts" },
    { id: "user_edit", name: "Edit Users", category: "User Management", description: "Modify user information" },
    { id: "user_delete", name: "Delete Users", category: "User Management", description: "Remove user accounts" },
    { id: "user_view", name: "View Users", category: "User Management", description: "View user profiles" },
    
    // Academic Management
    { id: "course_create", name: "Create Courses", category: "Academic", description: "Create new courses" },
    { id: "course_edit", name: "Edit Courses", category: "Academic", description: "Modify course details" },
    { id: "grade_edit", name: "Edit Grades", category: "Academic", description: "Modify student grades" },
    { id: "exam_schedule", name: "Schedule Exams", category: "Academic", description: "Create exam schedules" },
    
    // Financial Management
    { id: "fee_view", name: "View Fees", category: "Financial", description: "View fee information" },
    { id: "fee_collect", name: "Collect Fees", category: "Financial", description: "Process fee payments" },
    { id: "fee_refund", name: "Process Refunds", category: "Financial", description: "Process fee refunds" },
    { id: "financial_reports", name: "Financial Reports", category: "Financial", description: "Generate financial reports" },
    
    // System Administration
    { id: "system_backup", name: "System Backup", category: "System", description: "Perform system backups" },
    { id: "system_logs", name: "View Logs", category: "System", description: "Access system logs" },
    { id: "system_settings", name: "System Settings", category: "System", description: "Modify system settings" },
    { id: "bulk_import", name: "Bulk Import", category: "System", description: "Import data in bulk" },
    
    // Communication
    { id: "send_notifications", name: "Send Notifications", category: "Communication", description: "Send system notifications" },
    { id: "send_emails", name: "Send Emails", category: "Communication", description: "Send email communications" },
    { id: "view_messages", name: "View Messages", category: "Communication", description: "View user messages" }
  ];

  const roles: Role[] = [
    {
      id: "super_admin",
      name: "Super Administrator",
      description: "Full system access with all permissions",
      userCount: 2,
      permissions: permissions.map(p => p.id),
      color: "bg-red-100 text-red-800"
    },
    {
      id: "admin",
      name: "Administrator",
      description: "Administrative access with limited system permissions",
      userCount: 5,
      permissions: ["user_create", "user_edit", "user_view", "course_create", "course_edit", "fee_view", "fee_collect", "send_notifications", "send_emails"],
      color: "bg-purple-100 text-purple-800"
    },
    {
      id: "faculty",
      name: "Faculty",
      description: "Teaching staff with academic permissions",
      userCount: 85,
      permissions: ["user_view", "course_edit", "grade_edit", "exam_schedule", "send_notifications"],
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: "accountant",
      name: "Accountant", 
      description: "Financial management permissions",
      userCount: 3,
      permissions: ["fee_view", "fee_collect", "fee_refund", "financial_reports"],
      color: "bg-green-100 text-green-800"
    },
    {
      id: "student",
      name: "Student",
      description: "Basic student access permissions",
      userCount: 1250,
      permissions: ["user_view"],
      color: "bg-yellow-100 text-yellow-800"
    }
  ];

  const users: UserPermission[] = [
    {
      id: "1",
      name: "Dr. Rajesh Kumar",
      email: "rajesh.kumar@yukti.edu.in",
      role: "admin",
      department: "Computer Science",
      status: "active",
      customPermissions: [],
      lastLogin: "2024-10-01 09:30"
    },
    {
      id: "2",
      name: "Prof. Priya Sharma",
      email: "priya.sharma@yukti.edu.in", 
      role: "faculty",
      department: "Electronics",
      status: "active",
      customPermissions: ["financial_reports"],
      lastLogin: "2024-10-01 14:15"
    },
    {
      id: "3",
      name: "Amit Singh",
      email: "amit.singh@yukti.edu.in",
      role: "accountant",
      department: "Administration",
      status: "active",
      customPermissions: [],
      lastLogin: "2024-10-01 11:45"
    }
  ];

  const filteredUsers = users.filter(u => 
    (selectedRole === "all" || u.role === selectedRole) &&
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "User Management": return Users;
      case "Academic": return GraduationCap;
      case "Financial": return CreditCard;
      case "System": return Settings;
      case "Communication": return Mail;
      default: return Shield;
    }
  };

  return (
    <DashboardLayout title="User Permissions" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">User Permissions</h2>
            <p className="text-muted-foreground">Manage user roles and access permissions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        <Tabs defaultValue="roles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
            <TabsTrigger value="users">User Permissions</TabsTrigger>
            <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-6">
            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roles.map((role) => (
                <Card key={role.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                      <Badge className={role.color}>
                        {role.userCount} users
                      </Badge>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Permissions ({role.permissions.length})</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.slice(0, 6).map((permId) => {
                            const permission = permissions.find(p => p.id === permId);
                            return permission ? (
                              <Badge key={permId} variant="outline" className="text-xs">
                                {permission.name}
                              </Badge>
                            ) : null;
                          })}
                          {role.permissions.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Permission Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Categories</CardTitle>
                <CardDescription>All available system permissions organized by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["User Management", "Academic", "Financial", "System", "Communication"].map((category) => {
                    const categoryPermissions = permissions.filter(p => p.category === category);
                    const CategoryIcon = getCategoryIcon(category);
                    
                    return (
                      <div key={category}>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <CategoryIcon className="h-4 w-4" />
                          {category}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {categoryPermissions.map((permission) => (
                            <div key={permission.id} className="p-3 border rounded-lg">
                              <p className="font-medium text-sm">{permission.name}</p>
                              <p className="text-xs text-gray-600">{permission.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Search and Filter */}
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
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Users List */}
            <div className="space-y-4">
              {filteredUsers.map((userPerm) => {
                const userRole = roles.find(r => r.id === userPerm.role);
                const totalPermissions = userRole ? userRole.permissions.length + userPerm.customPermissions.length : userPerm.customPermissions.length;
                
                return (
                  <Card key={userPerm.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{userPerm.name}</h3>
                            <p className="text-sm text-gray-600">{userPerm.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={userRole?.color}>
                                {userRole?.name}
                              </Badge>
                              <Badge variant="outline">{userPerm.department}</Badge>
                              <Badge className={
                                userPerm.status === 'active' ? 'bg-green-100 text-green-800' :
                                userPerm.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {userPerm.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4 mb-2">
                            <div>
                              <p className="text-sm text-gray-600">Permissions</p>
                              <p className="font-semibold">{totalPermissions}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Last Login</p>
                              <p className="font-semibold text-sm">{userPerm.lastLogin}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(userPerm)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                            <Button variant="outline" size="sm">
                              {userPerm.status === 'active' ? (
                                <>
                                  <Lock className="h-4 w-4 mr-2" />
                                  Suspend
                                </>
                              ) : (
                                <>
                                  <Unlock className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {userPerm.customPermissions.length > 0 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm font-medium text-yellow-800 mb-2">Custom Permissions:</p>
                          <div className="flex flex-wrap gap-1">
                            {userPerm.customPermissions.map((permId) => {
                              const permission = permissions.find(p => p.id === permId);
                              return permission ? (
                                <Badge key={permId} className="bg-yellow-200 text-yellow-800">
                                  {permission.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
                <CardDescription>Overview of permissions assigned to each role</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-semibold">Permission</th>
                        {roles.map((role) => (
                          <th key={role.id} className="text-center p-3 font-semibold">
                            <div className="text-sm">{role.name}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((permission) => (
                        <tr key={permission.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-sm">{permission.name}</p>
                              <p className="text-xs text-gray-600">{permission.description}</p>
                            </div>
                          </td>
                          {roles.map((role) => (
                            <td key={role.id} className="text-center p-3">
                              {role.permissions.includes(permission.id) ? (
                                <CheckSquare className="h-5 w-5 text-green-600 mx-auto" />
                              ) : (
                                <Square className="h-5 w-5 text-gray-300 mx-auto" />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Permission Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Manage Permissions - {selectedUser.name}</CardTitle>
                <CardDescription>Configure user role and custom permissions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Select value={selectedUser.role}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select value={selectedUser.status}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold">Additional Permissions</Label>
                  <p className="text-sm text-gray-600 mb-4">Grant additional permissions beyond the assigned role</p>
                  
                  <div className="space-y-4">
                    {["User Management", "Academic", "Financial", "System", "Communication"].map((category) => {
                      const categoryPermissions = permissions.filter(p => p.category === category);
                      const CategoryIcon = getCategoryIcon(category);
                      
                      return (
                        <div key={category}>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4" />
                            {category}
                          </h4>
                          <div className="space-y-2 pl-6">
                            {categoryPermissions.map((permission) => (
                              <div key={permission.id} className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium">{permission.name}</p>
                                  <p className="text-xs text-gray-600">{permission.description}</p>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={selectedUser.customPermissions.includes(permission.id)}
                                  className="rounded"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
