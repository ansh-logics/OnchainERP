"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { getCurrentUser } from "@/lib/auth";
import { 
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkImportUsers,
  resetUserPassword,
  User,
  CreateUserData
} from "@/lib/api";
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
  Unlock,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  BookOpen,
  Trash2
} from "lucide-react";

export default function AdminUsersPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'student',
    phone: '',
    studentId: '',
    facultyId: ''
  });
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  
  // Message states
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();

  // Load users from backend
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadUsers();
  }, [router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetchUsers();
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setErrorMessage(response.message || 'Failed to load users');
      }
    } catch (error) {
      setErrorMessage('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearMessages();

    try {
      const response = await createUser(formData);
      if (response.success) {
        setSuccessMessage('User created successfully');
        setIsCreateModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          phone: '',
          studentId: '',
          facultyId: ''
        });
        loadUsers();
      } else {
        setErrorMessage(response.message || 'Failed to create user');
      }
    } catch (error) {
      setErrorMessage('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    clearMessages();

    try {
      const response = await updateUser(selectedUser.id, formData);
      if (response.success) {
        setSuccessMessage('User updated successfully');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        loadUsers();
      } else {
        setErrorMessage(response.message || 'Failed to update user');
      }
    } catch (error) {
      setErrorMessage('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    clearMessages();
    try {
      const response = await deleteUser(userId);
      if (response.success) {
        setSuccessMessage('User deleted successfully');
        loadUsers();
      } else {
        setErrorMessage(response.message || 'Failed to delete user');
      }
    } catch (error) {
      setErrorMessage('Failed to delete user');
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return;
    
    clearMessages();
    try {
      const response = await resetUserPassword(userId);
      if (response.success && response.data) {
        setSuccessMessage(`Password reset successfully. New password: ${response.data.tempPassword}`);
      } else {
        setErrorMessage(response.message || 'Failed to reset password');
      }
    } catch (error) {
      setErrorMessage('Failed to reset password');
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImportFile) return;

    setIsSubmitting(true);
    clearMessages();

    try {
      const response = await bulkImportUsers(bulkImportFile);
      if (response.success) {
        setSuccessMessage(`Bulk import completed: ${response.data?.created || 0} created, ${response.data?.updated || 0} updated`);
        setIsBulkImportModalOpen(false);
        setBulkImportFile(null);
        loadUsers();
      } else {
        setErrorMessage(response.message || 'Failed to import users');
      }
    } catch (error) {
      setErrorMessage('Failed to import users');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role as CreateUserData['role'],
      phone: user.phone || '',
      studentId: user.studentId || '',
      facultyId: user.facultyId || ''
    });
    setIsEditModalOpen(true);
  };

  const handleExportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Phone', 'Student ID', 'Faculty ID', 'Status', 'Created At'].join(','),
      ...users.map(user => [
        user.name,
        user.email,
        user.role,
        user.phone || '',
        user.studentId || '',
        user.facultyId || '',
        user.isActive ? 'Active' : 'Inactive',
        new Date(user.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="User Management" userRole="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  // Filter and search logic
  const filteredUsers = users.filter((usr: User) => {
    const matchesSearch = usr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usr.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = selectedTab === 'all' || 
                      (selectedTab === 'active' && usr.isActive) ||
                      (selectedTab === 'inactive' && !usr.isActive) ||
                      (selectedTab === usr.role);
    
    return matchesSearch && matchesTab;
  });

  const userStats = {
    total: users.length,
    active: users.filter((usr: User) => usr.isActive).length,
    inactive: users.filter((usr: User) => !usr.isActive).length,
    faculty: users.filter((usr: User) => usr.role === 'faculty').length,
    admin: users.filter((usr: User) => usr.role === 'admin').length,
    student: users.filter((usr: User) => usr.role === 'student').length,
    cashier: users.filter((usr: User) => usr.role === 'cashier').length,
  };

  return (
    <DashboardLayout title="User Management" userRole="admin">
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{errorMessage}</AlertDescription>
          </Alert>
        )}

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
            <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
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
                  <div className="text-xl font-bold text-purple-600">{userStats.faculty}</div>
                  <p className="text-sm text-gray-600">Faculty</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-xl font-bold text-orange-600">{userStats.student}</div>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedTab === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab('all')}
                >
                  All ({userStats.total})
                </Button>
                <Button
                  variant={selectedTab === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab('active')}
                >
                  Active ({userStats.active})
                </Button>
                <Button
                  variant={selectedTab === 'faculty' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab('faculty')}
                >
                  Faculty ({userStats.faculty})
                </Button>
                <Button
                  variant={selectedTab === 'student' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTab('student')}
                >
                  Students ({userStats.student})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Role */}
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-gray-500" />
                    <Badge variant="outline" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>

                  {/* Phone */}
                  {user.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{user.phone}</span>
                    </div>
                  )}

                  {/* Student/Faculty ID */}
                  {(user.studentId || user.facultyId) && (
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        ID: {user.studentId || user.facultyId}
                      </span>
                    </div>
                  )}

                  {/* Last Login */}
                  {user.lastLogin && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Last login: {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(user)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleResetPassword(user.id)}>
                      <Lock className="h-4 w-4 mr-1" />
                      Reset
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create User Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Add a new user to the system with appropriate role and permissions.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as CreateUserData['role']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {formData.role === 'student' && (
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  />
                </div>
              )}

              {formData.role === 'faculty' && (
                <div>
                  <Label htmlFor="facultyId">Faculty ID</Label>
                  <Input
                    id="facultyId"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value as CreateUserData['role']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="faculty">Faculty</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {formData.role === 'student' && (
                <div>
                  <Label htmlFor="edit-studentId">Student ID</Label>
                  <Input
                    id="edit-studentId"
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  />
                </div>
              )}

              {formData.role === 'faculty' && (
                <div>
                  <Label htmlFor="edit-facultyId">Faculty ID</Label>
                  <Input
                    id="edit-facultyId"
                    value={formData.facultyId}
                    onChange={(e) => setFormData({...formData, facultyId: e.target.value})}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Bulk Import Modal */}
        <Dialog open={isBulkImportModalOpen} onOpenChange={setIsBulkImportModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Bulk Import Users
              </DialogTitle>
              <DialogDescription>
                Upload a CSV file with user data. Download the template for the correct format.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleBulkImport} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csvFile" className="text-sm font-medium">CSV File</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBulkImportFile(e.target.files?.[0] || null)}
                    required
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const csvContent = 'name,email,role,phone,studentId,facultyId,password\nDr. Rajesh Kumar,rajesh.kumar@college.edu,faculty,9876543210,,FAC001,TempPass123!\nArjun Malhotra,arjun.malhotra@student.edu,student,9876543215,STU001,,TempPass123!\nAditi Verma,aditi.verma@staff.edu,admin,9876543225,,,TempPass123!';
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'user-import-template.csv';
                      a.click();
                      window.URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-md p-2">
                  <div className="flex flex-wrap gap-1">
                    <div className="text-xs text-amber-800 font-medium mb-1 w-full">Required:</div>
                    {['name', 'email', 'role', 'phone'].map((col) => (
                      <span key={col} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                        {col}
                      </span>
                    ))}
                    <div className="text-xs text-gray-600 font-medium mb-1 w-full mt-2">Optional:</div>
                    {['studentId', 'facultyId', 'password'].map((col) => (
                      <span key={col} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  CSV Template Format
                </h4>
                
                <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Role</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Phone</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Student ID</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Faculty ID</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">Password</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-2 border-r text-gray-900">Dr. Rajesh Kumar</td>
                          <td className="px-3 py-2 border-r text-gray-700">rajesh.kumar@college.edu</td>
                          <td className="px-3 py-2 border-r text-gray-700 font-mono">faculty</td>
                          <td className="px-3 py-2 border-r text-gray-600">9876543210</td>
                          <td className="px-3 py-2 border-r text-gray-500 italic">(empty)</td>
                          <td className="px-3 py-2 border-r text-gray-700">FAC001</td>
                          <td className="px-3 py-2 text-gray-600">TempPass123!</td>
                        </tr>
                        <tr className="border-t bg-gray-50">
                          <td className="px-3 py-2 border-r text-gray-900">Arjun Malhotra</td>
                          <td className="px-3 py-2 border-r text-gray-700">arjun.malhotra@student.edu</td>
                          <td className="px-3 py-2 border-r text-gray-700 font-mono">student</td>
                          <td className="px-3 py-2 border-r text-gray-600">9876543215</td>
                          <td className="px-3 py-2 border-r text-gray-700">STU001</td>
                          <td className="px-3 py-2 border-r text-gray-500 italic">(empty)</td>
                          <td className="px-3 py-2 text-gray-600">TempPass123!</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between items-center pt-3 border-t">
                <div className="text-sm text-gray-600">
                  {bulkImportFile ? (
                    <span className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      {bulkImportFile.name}
                    </span>
                  ) : (
                    <span className="text-gray-500">No file selected</span>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setIsBulkImportModalOpen(false);
                      setBulkImportFile(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !bulkImportFile} 
                    className="min-w-[150px]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Users
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
