"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { getCurrentUser } from "@/lib/auth";
import { ViewProfileModal, EditUserModal, SuspendUserModal } from "@/components/admin/user-modals";
import { 
  Search,
  Users, 
  UserPlus, 
  Edit, 
  Shield, 
  Mail,
  Phone,
  Calendar,
  Eye,
  Filter,
  Download,
  MoreVertical,
  UserCheck,
  UserX,
  Lock,
  Unlock
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  joinDate: string;
  status: string;
  lastLogin: string;
  permissions: string[];
}

export default function AdminUsersPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  // Initialize mock users data
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Initialize users data in the same effect
    const initialUsers = [
      {
        id: '1',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@college.edu',
        phone: '+91 9876543210',
        role: 'faculty',
        department: 'Computer Science',
        designation: 'Professor & HOD',
        joinDate: '2020-08-15',
        status: 'active',
        lastLogin: '2024-03-15 10:30 AM',
        permissions: ['course_manage', 'student_grade', 'exam_conduct']
      },
      {
        id: '2',
        name: 'Ms. Priya Sharma',
        email: 'priya.sharma@college.edu',
        phone: '+91 9876543211',
        role: 'staff',
        department: 'Admissions',
        designation: 'Admissions Officer',
        joinDate: '2021-06-01',
        status: 'active',
        lastLogin: '2024-03-15 09:15 AM',
        permissions: ['admission_manage', 'document_verify', 'fee_collect']
      },
      {
        id: '3',
        name: 'Arjun Malhotra',
        email: 'arjun.malhotra@student.college.edu',
        phone: '+91 9876543212',
        role: 'student',
        department: 'Computer Science',
        designation: 'B.Tech 3rd Year',
        joinDate: '2021-08-01',
        status: 'active',
        lastLogin: '2024-03-15 11:45 AM',
        permissions: ['profile_edit', 'fee_pay', 'course_view']
      },
      {
        id: '4',
        name: 'Mr. Amit Patel',
        email: 'amit.patel@college.edu',
        phone: '+91 9876543213',
        role: 'admin',
        department: 'IT Administration',
        designation: 'System Administrator',
        joinDate: '2019-03-20',
        status: 'active',
        lastLogin: '2024-03-15 08:00 AM',
        permissions: ['user_manage', 'system_config', 'backup_restore', 'audit_view']
      },
      {
        id: '5',
        name: 'Dr. Kavya Nair',
        email: 'kavya.nair@college.edu',
        phone: '+91 9876543214',
        role: 'faculty',
        department: 'Electronics',
        designation: 'Associate Professor',
        joinDate: '2022-01-10',
        status: 'inactive',
        lastLogin: '2024-02-28 04:20 PM',
        permissions: ['course_manage', 'student_grade']
      }
    ];
    setUsers(initialUsers);
  }, [router]);

  // Early return if user is not loaded or not admin
  if (!user) {
    return <div>Loading...</div>;
  }

  const rolePermissions = {
    student: ['Profile Management', 'Fee Payment', 'Course Access', 'Library Access'],
    faculty: ['Course Management', 'Student Grading', 'Exam Conduct', 'Research Access'],
    staff: ['Department Operations', 'Student Services', 'Fee Collection', 'Document Management'],
    admin: ['User Management', 'System Configuration', 'Reports Access', 'Audit Logs', 'Backup & Restore']
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'faculty': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-orange-100 text-orange-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4" />;
      case 'inactive': return <UserX className="h-4 w-4" />;
      case 'suspended': return <Lock className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  // Handler functions for modals
  const handleViewProfile = (userData: User) => {
    setSelectedUser(userData);
    setViewModalOpen(true);
  };

  const handleEditUser = (userData: User) => {
    setSelectedUser(userData);
    setEditModalOpen(true);
  };

  const handleSuspendUser = (userData: User) => {
    setSelectedUser(userData);
    setSuspendModalOpen(true);
  };

  const handleSaveUser = (updatedData: User) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === updatedData.id ? updatedData : u)
    );
  };

  const handleSuspendConfirm = (userId: string, reason: string) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userId ? { ...u, status: 'suspended' } : u)
    );
    alert(`User suspended. Reason: ${reason}`);
  };

  const handleExportUsers = () => {
    const csvData = users.map(user => ({
      Name: user.name,
      Email: user.email,
      Phone: user.phone,
      Role: user.role,
      Department: user.department,
      Status: user.status,
      'Join Date': user.joinDate,
      'Last Login': user.lastLogin
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0]).join(",") + "\n"
      + csvData.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "users_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((usr: User) => 
    selectedTab === 'all' ? true : usr.role === selectedTab
  ).filter((usr: User) => 
    usr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usr.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userStats = {
    total: users.length,
    active: users.filter((usr: User) => usr.status === 'active').length,
    inactive: users.filter((usr: User) => usr.status === 'inactive').length,
    admin: users.filter((usr: User) => usr.role === 'admin').length,
    faculty: users.filter((usr: User) => usr.role === 'faculty').length,
    staff: users.filter((usr: User) => usr.role === 'staff').length,
    student: users.filter((usr: User) => usr.role === 'student').length,
  };

  return (
    <DashboardLayout title="User Management" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Management</h2>
            <p className="text-gray-600">Manage system users, roles, and permissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{userStats.total}</div>
                  <p className="text-sm text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold text-green-600">{userStats.active}</div>
                  <p className="text-sm text-gray-600">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-xl font-bold text-purple-600">{userStats.admin + userStats.staff}</div>
                  <p className="text-sm text-gray-600">Admin & Staff</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserX className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-xl font-bold text-red-600">{userStats.inactive}</div>
                  <p className="text-sm text-gray-600">Inactive Users</p>
                </div>
              </div>
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
                    placeholder="Search users by name, email, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>System Users</CardTitle>
            <CardDescription>Complete list of all system users with their roles and permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="all">All Users ({userStats.total})</TabsTrigger>
                <TabsTrigger value="admin">Admin ({userStats.admin})</TabsTrigger>
                <TabsTrigger value="faculty">Faculty ({userStats.faculty})</TabsTrigger>
                <TabsTrigger value="staff">Staff ({userStats.staff})</TabsTrigger>
                <TabsTrigger value="student">Students ({userStats.student})</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                <div className="space-y-4">
                  {filteredUsers.map((usr) => (
                    <div key={usr.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            {getStatusIcon(usr.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold flex items-center gap-2">
                              {usr.name}
                              <Badge className={getRoleColor(usr.role)}>
                                {usr.role.toUpperCase()}
                              </Badge>
                            </h3>
                            <p className="text-sm text-gray-600">{usr.designation} • {usr.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(usr.status)}>
                            {usr.status.toUpperCase()}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{usr.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{usr.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>Joined: {new Date(usr.joinDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="font-medium text-sm mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {usr.permissions.map((permission: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {permission.replace('_', ' ').toUpperCase()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-600">
                          <span className="font-medium">Last Login:</span> {usr.lastLogin}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewProfile(usr)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View Profile
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditUser(usr)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          {usr.status === 'active' ? (
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleSuspendUser(usr)}>
                              <Lock className="h-4 w-4 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleSaveUser({...usr, status: 'active'})}>
                              <Unlock className="h-4 w-4 mr-1" />
                              Activate
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No users found matching your criteria.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Role Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Role Permissions Matrix</CardTitle>
            <CardDescription>Overview of permissions assigned to each user role</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5" />
                    <h3 className="font-semibold capitalize">{role}</h3>
                    <Badge className={getRoleColor(role)} variant="outline">
                      {users.filter((usr: User) => usr.role === role).length}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {permissions.map((permission, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{permission}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedUser && (
        <>
          <ViewProfileModal
            isOpen={viewModalOpen}
            onClose={() => setViewModalOpen(false)}
            userData={selectedUser}
          />
          <EditUserModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            userData={selectedUser}
            onSave={handleSaveUser}
          />
          <SuspendUserModal
            isOpen={suspendModalOpen}
            onClose={() => setSuspendModalOpen(false)}
            userData={selectedUser}
            onSuspend={handleSuspendConfirm}
          />
        </>
      )}
    </DashboardLayout>
  );
}
