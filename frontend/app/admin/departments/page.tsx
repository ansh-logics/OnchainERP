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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth";
import { 
  fetchDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  bulkImportDepartments,
  Department,
  CreateDepartmentData,
} from "@/lib/api";
import { 
  Building,
  Plus,
  Edit,
  Users,
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Phone,
  Mail,
  User,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Download
} from "lucide-react";

export default function DepartmentManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState<CreateDepartmentData>({
    name: '',
    shortName: '',
    code: '',
    description: '',
    studentsPerSection: 60,
    totalSections: 1,
    totalIntake: 60,
    currentStrength: 0,
    programs: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const router = useRouter();

  // Load departments on component mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadDepartments();
    } else {
      router.push('/auth/login');
    }
    setIsLoading(false);
  }, [router]);

  const loadDepartments = async () => {
    try {
      setIsLoading(true);
      const response = await fetchDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      } else {
        setError(response.error || 'Failed to load departments');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Add college ID from user context
      const departmentData = {
        ...formData,
        college: user.collegeId || user.college?.id
      };

      const response = await createDepartment(departmentData);
      if (response.success) {
        setSuccess('Department created successfully!');
        setIsCreateModalOpen(false);
        resetForm();
        loadDepartments();
      } else {
        setError(response.error || 'Failed to create department');
      }
    } catch (err) {
      setError('Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateDepartment(selectedDepartment.id, formData);
      if (response.success) {
        setSuccess('Department updated successfully!');
        setIsEditModalOpen(false);
        resetForm();
        setSelectedDepartment(null);
        loadDepartments();
      } else {
        setError(response.error || 'Failed to update department');
      }
    } catch (err) {
      setError('Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const response = await deleteDepartment(id);
      if (response.success) {
        setSuccess('Department deleted successfully!');
        loadDepartments();
      } else {
        setError(response.error || 'Failed to delete department');
      }
    } catch (err) {
      setError('Failed to delete department');
    }
  };

  const handleBulkImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkImportFile) {
      setError('Please select a CSV file');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await bulkImportDepartments(bulkImportFile);
      if (response.success) {
        setSuccess('Departments imported successfully!');
        setIsBulkImportModalOpen(false);
        setBulkImportFile(null);
        loadDepartments();
      } else {
        setError(response.error || 'Failed to import departments');
      }
    } catch (err) {
      setError('Failed to import departments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      shortName: '',
      code: '',
      description: '',
      studentsPerSection: 60,
      totalSections: 1,
      totalIntake: 60,
      currentStrength: 0,
      programs: []
    });
  };

  const openEditModal = (department: Department) => {
    setSelectedDepartment(department);
    setFormData({
      name: department.name,
      shortName: department.shortName,
      code: department.code,
      description: department.description,
      hod: department.hodId,
      studentsPerSection: department.studentsPerSection,
      totalSections: department.totalSections,
      totalIntake: department.totalIntake,
      currentStrength: department.currentStrength,
      programs: department.programs || []
    });
    setIsEditModalOpen(true);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.shortName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.hod?.name && dept.hod.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout title="Department Management" userRole="admin">
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Department Management</h2>
            <p className="text-muted-foreground">Manage academic departments and their information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsBulkImportModalOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          </div>
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
                  <p className="text-sm text-gray-600">Total Intake Capacity</p>
                  <p className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + (dept.totalIntake || 0), 0)}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Strength</p>
                  <p className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + (dept.currentStrength || 0), 0)}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sections</p>
                  <p className="text-2xl font-bold">{departments.reduce((sum, dept) => sum + (dept.totalSections || 0), 0)}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange-600" />
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
                        <CardDescription>({department.code}) - {department.shortName}</CardDescription>
                      </div>
                      <Badge className={department.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {department.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Description */}
                      <div className="text-sm text-gray-600">
                        {department.description}
                      </div>

                      {/* HOD Information */}
                      {department.hod && (
                      <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">HOD: {department.hod.name}</span>
                      </div>
                      )}

                      {/* Section Configuration */}
                      <div className="grid grid-cols-2 gap-4 text-center bg-gray-50 p-3 rounded">
                        <div>
                          <p className="text-lg font-bold text-blue-600">{department.studentsPerSection}</p>
                          <p className="text-xs text-gray-500">Students/Section</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600">{department.totalSections}</p>
                          <p className="text-xs text-gray-500">Total Sections</p>
                        </div>
                      </div>

                      {/* Intake Information */}
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-lg font-bold text-purple-600">{department.totalIntake}</p>
                          <p className="text-xs text-gray-500">Total Intake</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-orange-600">{department.currentStrength}</p>
                          <p className="text-xs text-gray-500">Current Strength</p>
                      </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEditModal(department)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteDepartment(department.id)}>
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
                                <Building className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="font-medium">{department.shortName}</p>
                                  <p className="text-sm text-gray-600">Short Name</p>
                                </div>
                              </div>
                              {department.hod && (
                              <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <div>
                                    <p className="font-medium">{department.hod.name}</p>
                                    <p className="text-sm text-gray-600">Head of Department</p>
                              </div>
                              </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Badge className={department.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                  {department.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-4">Department Configuration</h4>
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Students Per Section</span>
                                <span className="text-sm font-medium">{department.studentsPerSection}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Sections</span>
                                <span className="text-sm font-medium">{department.totalSections}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Intake</span>
                                <span className="text-sm font-medium">{department.totalIntake}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Current Strength</span>
                                <span className="text-sm font-medium">{department.currentStrength}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Created</span>
                                <span className="text-sm font-medium">{new Date(department.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h5 className="font-medium text-sm text-gray-700 mb-2">Description</h5>
                              <p className="text-sm text-gray-600">{department.description}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-6 pt-4 border-t">
                          <Button variant="outline" size="sm" onClick={() => openEditModal(department)}>
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
                          <p className="text-2xl font-bold text-blue-600">{dept.studentsPerSection}</p>
                          <p className="text-sm text-gray-600">Students Per Section</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{dept.totalSections}</p>
                          <p className="text-sm text-gray-600">Total Sections</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{dept.totalIntake}</p>
                          <p className="text-sm text-gray-600">Total Intake</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-orange-600">{dept.currentStrength}</p>
                          <p className="text-sm text-gray-600">Current Strength</p>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Capacity Utilization</span>
                          <span className="text-sm font-medium">
                            {dept.totalIntake > 0 ? ((dept.currentStrength / dept.totalIntake) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ 
                              width: `${dept.totalIntake > 0 ? Math.min((dept.currentStrength / dept.totalIntake) * 100, 100) : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Department Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
                <CardDescription>Overview of all departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => (
                      <div key={dept.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">{dept.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({dept.code})</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{dept.currentStrength}/{dept.totalIntake}</div>
                          <div className="text-xs text-gray-500">Current/Total</div>
                        </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${dept.totalIntake > 0 ? Math.min((dept.currentStrength / dept.totalIntake) * 100, 100) : 0}%` 
                          }}
                          ></div>
                        </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{dept.totalSections} sections</span>
                        <span>{dept.studentsPerSection} students/section</span>
                        <span>{dept.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Department Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateDepartment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Department Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Computer Science"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="CS"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Department Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CSE"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="studentsPerSection">Students Per Section</Label>
                  <Input
                    id="studentsPerSection"
                    type="number"
                    value={formData.studentsPerSection}
                    onChange={(e) => setFormData({ ...formData, studentsPerSection: parseInt(e.target.value) || 60 })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalSections">Total Sections</Label>
                  <Input
                    id="totalSections"
                    type="number"
                    value={formData.totalSections}
                    onChange={(e) => setFormData({ ...formData, totalSections: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="totalIntake">Total Intake</Label>
                  <Input
                    id="totalIntake"
                    type="number"
                    value={formData.totalIntake}
                    onChange={(e) => setFormData({ ...formData, totalIntake: parseInt(e.target.value) || 60 })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department description..."
                  rows={3}
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
                    'Create Department'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Department Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateDepartment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Department Name</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Computer Science"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-shortName">Short Name</Label>
                  <Input
                    id="edit-shortName"
                    value={formData.shortName}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    placeholder="CS"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-code">Department Code</Label>
                  <Input
                    id="edit-code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="CSE"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-studentsPerSection">Students Per Section</Label>
                  <Input
                    id="edit-studentsPerSection"
                    type="number"
                    value={formData.studentsPerSection}
                    onChange={(e) => setFormData({ ...formData, studentsPerSection: parseInt(e.target.value) || 60 })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalSections">Total Sections</Label>
                  <Input
                    id="edit-totalSections"
                    type="number"
                    value={formData.totalSections}
                    onChange={(e) => setFormData({ ...formData, totalSections: parseInt(e.target.value) || 1 })}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-totalIntake">Total Intake</Label>
                  <Input
                    id="edit-totalIntake"
                    type="number"
                    value={formData.totalIntake}
                    onChange={(e) => setFormData({ ...formData, totalIntake: parseInt(e.target.value) || 60 })}
                    min="1"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Department description..."
                  rows={3}
                />
              </div>
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
                    'Update Department'
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
                Bulk Import Departments
              </DialogTitle>
              <DialogDescription>
                Upload a CSV file with department data. Download the template for the correct format.
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
                      const csvContent = 'name,shortName,code,description,studentsPerSection,totalSections,totalIntake,currentStrength,hodId\nComputer Science,CS,CSE,Department of Computer Science,60,4,240,0,\nElectrical Engineering,EE,EEE,Department of Electrical Engineering,60,3,180,0,\nMechanical Engineering,ME,MECH,Department of Mechanical Engineering,50,2,100,0,';
                      const blob = new Blob([csvContent], { type: 'text/csv' });
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'department-import-template.csv';
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
                    {['name', 'shortName', 'code', 'description', 'studentsPerSection', 'totalSections', 'totalIntake'].map((col) => (
                      <span key={col} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                        {col}
                      </span>
                    ))}
                    <div className="text-xs text-gray-600 font-medium mb-1 w-full mt-2">Optional:</div>
                    {['currentStrength', 'hodId'].map((col) => (
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
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Short Name</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Code</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700 border-r">Description</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700 border-r">Students/Section</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700 border-r">Total Sections</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700 border-r">Total Intake</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-700 border-r">Current Strength</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-700">HOD ID</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-3 py-2 border-r text-gray-900">Computer Science</td>
                          <td className="px-3 py-2 border-r text-gray-700">CS</td>
                          <td className="px-3 py-2 border-r text-gray-700 font-mono">CSE</td>
                          <td className="px-3 py-2 border-r text-gray-600">Department of Computer Science</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">60</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">4</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">240</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">0</td>
                          <td className="px-3 py-2 text-gray-500 italic">(optional)</td>
                        </tr>
                        <tr className="border-t bg-gray-50">
                          <td className="px-3 py-2 border-r text-gray-900">Electrical Engineering</td>
                          <td className="px-3 py-2 border-r text-gray-700">EE</td>
                          <td className="px-3 py-2 border-r text-gray-700 font-mono">EEE</td>
                          <td className="px-3 py-2 border-r text-gray-600">Department of Electrical Engineering</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">60</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">3</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">180</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">0</td>
                          <td className="px-3 py-2 text-gray-500 italic">(optional)</td>
                        </tr>
                        <tr className="border-t">
                          <td className="px-3 py-2 border-r text-gray-900">Mechanical Engineering</td>
                          <td className="px-3 py-2 border-r text-gray-700">ME</td>
                          <td className="px-3 py-2 border-r text-gray-700 font-mono">MECH</td>
                          <td className="px-3 py-2 border-r text-gray-600">Department of Mechanical Engineering</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">50</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">2</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">100</td>
                          <td className="px-3 py-2 border-r text-center text-gray-700">0</td>
                          <td className="px-3 py-2 text-gray-500 italic">(optional)</td>
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
                        Import Departments
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
