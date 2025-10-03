"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth";
import { 
  Shield,
  Users,
  UserCheck,
  Settings,
  Database,
  BookOpen,
  CreditCard,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  RotateCcw,
  Eye,
  Lock,
  Unlock
} from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
  category: string;
}

interface RolePermissions {
  role: string;
  grantedPermissions: Permission[];
  availablePermissions: Permission[];
  totalGranted: number;
  totalAvailable: number;
}

export default function UserPermissionsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('student');
  const [rolePermissions, setRolePermissions] = useState<RolePermissions | null>(null);
  const [permissionsSummary, setPermissionsSummary] = useState<any>(null);
  const [changedPermissions, setChangedPermissions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const roles = [
    { id: 'student', name: 'Student', icon: Users, color: 'bg-blue-500' },
    { id: 'faculty', name: 'Faculty', icon: UserCheck, color: 'bg-green-500' },
    { id: 'cashier', name: 'Cashier', icon: CreditCard, color: 'bg-orange-500' },
    { id: 'admin', name: 'Admin', icon: Shield, color: 'bg-purple-500' }
  ];

  const categoryIcons = {
    profile: Users,
    academic: BookOpen,
    attendance: CheckCircle,
    grades: FileText,
    assignments: BookOpen,
    fees: CreditCard,
    library: BookOpen,
    hostel: Building,
    users: Users,
    system: Settings,
    reports: FileText,
    general: Settings
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
      loadPermissionsSummary();
      loadRolePermissions(selectedRole);
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (user) {
      loadRolePermissions(selectedRole);
    }
  }, [selectedRole, user]);

  const loadPermissionsSummary = async () => {
    try {
      // Mock API call - replace with actual API
      const mockSummary = {
        student: { total: 12, permissions: {} },
        faculty: { total: 18, permissions: {} },
        cashier: { total: 8, permissions: {} },
        admin: { total: 25, permissions: {} }
      };
      setPermissionsSummary(mockSummary);
    } catch (err) {
      setError('Failed to load permissions summary');
    }
  };

  const loadRolePermissions = async (role: string) => {
    try {
      setIsLoading(true);
      // Mock API call - replace with actual API
      const mockRolePermissions: RolePermissions = {
        role,
        grantedPermissions: [
          {
            id: '1',
            name: 'view-own-profile',
            description: 'View own profile information',
            resource: 'profile',
            action: 'read',
            category: 'profile'
          },
          {
            id: '2',
            name: 'edit-own-profile',
            description: 'Edit own profile information',
            resource: 'profile',
            action: 'update',
            category: 'profile'
          }
        ],
        availablePermissions: [
          {
            id: '3',
            name: 'view-all-profiles',
            description: 'View all user profiles',
            resource: 'profile',
            action: 'read',
            category: 'profile'
          },
          {
            id: '4',
            name: 'manage-courses',
            description: 'Create and manage courses',
            resource: 'course',
            action: 'manage',
            category: 'academic'
          }
        ],
        totalGranted: 2,
        totalAvailable: 2
      };
      setRolePermissions(mockRolePermissions);
      setChangedPermissions(new Set());
    } catch (err) {
      setError('Failed to load role permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePermissionToggle = (permissionId: string, isGranted: boolean) => {
    if (!rolePermissions) return;

    setChangedPermissions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(permissionId)) {
        newSet.delete(permissionId);
      } else {
        newSet.add(permissionId);
      }
      return newSet;
    });

    // Update the UI state immediately
    if (isGranted) {
      // Move from granted to available
      const permission = rolePermissions.grantedPermissions.find(p => p.id === permissionId);
      if (permission) {
        setRolePermissions({
          ...rolePermissions,
          grantedPermissions: rolePermissions.grantedPermissions.filter(p => p.id !== permissionId),
          availablePermissions: [...rolePermissions.availablePermissions, permission],
          totalGranted: rolePermissions.totalGranted - 1
        });
      }
    } else {
      // Move from available to granted
      const permission = rolePermissions.availablePermissions.find(p => p.id === permissionId);
      if (permission) {
        setRolePermissions({
          ...rolePermissions,
          availablePermissions: rolePermissions.availablePermissions.filter(p => p.id !== permissionId),
          grantedPermissions: [...rolePermissions.grantedPermissions, permission],
          totalGranted: rolePermissions.totalGranted + 1
        });
      }
    }
  };

  const handleSaveChanges = async () => {
    if (changedPermissions.size === 0) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(`Successfully updated ${changedPermissions.size} permission(s) for ${selectedRole} role`);
      setChangedPermissions(new Set());
      loadPermissionsSummary();
    } catch (err) {
      setError('Failed to save permission changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetChanges = () => {
    setChangedPermissions(new Set());
    loadRolePermissions(selectedRole);
  };

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    return permissions.reduce((acc, permission) => {
      const category = permission.category || 'general';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="User Permissions" userRole="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Permissions" userRole="admin">
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
            <h2 className="text-2xl font-bold tracking-tight">User Permissions</h2>
            <p className="text-muted-foreground">Manage role-based permissions for your institution</p>
          </div>
          <div className="flex gap-2">
            {changedPermissions.size > 0 && (
              <>
                <Button variant="outline" onClick={handleResetChanges} disabled={isSubmitting}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Changes
                </Button>
                <Button onClick={handleSaveChanges} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes ({changedPermissions.size})
                    </>
                  )}
          </Button>
              </>
            )}
          </div>
        </div>

        {/* Role Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Select Role to Manage
            </CardTitle>
            <CardDescription>Choose a role to view and modify its permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {roles.map((role) => {
                const RoleIcon = role.icon;
                const isSelected = selectedRole === role.id;
                const roleStats = permissionsSummary?.[role.id];
                
                return (
                  <Card 
                    key={role.id}
                    className={`cursor-pointer border-2 transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedRole(role.id)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${role.color} text-white mb-4`}>
                        <RoleIcon className="h-6 w-6" />
                      </div>
                      <h3 className="font-semibold mb-2">{role.name}</h3>
                      {roleStats && (
                        <Badge variant="outline">
                          {roleStats.total} permissions
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Management */}
        {rolePermissions && (
          <Tabs defaultValue="granted" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="granted">
                Granted Permissions ({rolePermissions.totalGranted})
              </TabsTrigger>
              <TabsTrigger value="available">
                Available Permissions ({rolePermissions.availablePermissions.length})
              </TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

            <TabsContent value="granted" className="space-y-6">
              <Card>
                  <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="h-5 w-5 text-green-600" />
                    Granted Permissions for {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </CardTitle>
                  <CardDescription>Permissions currently assigned to this role</CardDescription>
                </CardHeader>
                <CardContent>
                  {rolePermissions.grantedPermissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Lock className="h-12 w-12 mx-auto mb-4" />
                      <p>No permissions granted to this role</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupPermissionsByCategory(rolePermissions.grantedPermissions)).map(([category, permissions]) => {
                        const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Settings;
                        
                        return (
                          <div key={category}>
                            <div className="flex items-center gap-2 mb-4">
                              <CategoryIcon className="h-4 w-4 text-gray-500" />
                              <h3 className="font-semibold capitalize">{category}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {permissions.map((permission) => (
                                <Card key={permission.id} className="border-green-200 bg-green-50">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium text-green-900">{permission.name}</h4>
                                        <p className="text-sm text-green-700 mt-1">{permission.description}</p>
                                        <div className="flex gap-2 mt-2">
                                          <Badge variant="outline" className="text-xs">
                                            {permission.resource}
                              </Badge>
                            <Badge variant="outline" className="text-xs">
                                            {permission.action}
                            </Badge>
                        </div>
                      </div>
                                      <Switch 
                                        checked={true}
                                        onCheckedChange={() => handlePermissionToggle(permission.id, true)}
                                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="available" className="space-y-6">
            <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-600" />
                    Available Permissions for {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
                  </CardTitle>
                  <CardDescription>Permissions that can be granted to this role</CardDescription>
              </CardHeader>
              <CardContent>
                  {rolePermissions.availablePermissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                      <p>All available permissions have been granted to this role</p>
                    </div>
                  ) : (
                <div className="space-y-6">
                      {Object.entries(groupPermissionsByCategory(rolePermissions.availablePermissions)).map(([category, permissions]) => {
                        const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons] || Settings;
                    
                    return (
                      <div key={category}>
                            <div className="flex items-center gap-2 mb-4">
                              <CategoryIcon className="h-4 w-4 text-gray-500" />
                              <h3 className="font-semibold capitalize">{category}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {permissions.map((permission) => (
                                <Card key={permission.id} className="border-gray-200">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h4 className="font-medium">{permission.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{permission.description}</p>
                                        <div className="flex gap-2 mt-2">
                                          <Badge variant="outline" className="text-xs">
                                            {permission.resource}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs">
                                            {permission.action}
                                          </Badge>
                                        </div>
                                      </div>
                                      <Switch 
                                        checked={false}
                                        onCheckedChange={() => handlePermissionToggle(permission.id, false)}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                  )}
              </CardContent>
            </Card>
          </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {permissionsSummary && Object.entries(permissionsSummary).map(([role, stats]) => {
                  const roleConfig = roles.find(r => r.id === role);
                  if (!roleConfig) return null;
                  
                  const RoleIcon = roleConfig.icon;
                
                return (
                    <Card key={role}>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-full ${roleConfig.color} text-white`}>
                            <RoleIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-semibold capitalize">{role}</h3>
                            <p className="text-sm text-gray-600">{(stats as any).total} permissions</p>
                          </div>
                        </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                          className="w-full"
                          onClick={() => setSelectedRole(role)}
                            >
                          <Eye className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}