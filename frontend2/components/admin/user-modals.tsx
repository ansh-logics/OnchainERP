"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Building,
  Shield,
  Clock,
  CheckCircle
} from "lucide-react";

interface UserData {
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

interface ViewProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
}

export function ViewProfileModal({ isOpen, onClose, userData }: ViewProfileModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'faculty': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'student': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            Detailed information about the user account
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="text-lg font-semibold">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{userData.name}</h3>
              <div className="flex gap-2 mt-1">
                <Badge className={getRoleColor(userData.role)}>
                  {userData.role.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(userData.status)}>
                  {userData.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-sm">{userData.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Phone</p>
                  <p className="text-sm">{userData.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Department</p>
                  <p className="text-sm">{userData.department}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Designation</p>
                  <p className="text-sm">{userData.designation}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Join Date</p>
                  <p className="text-sm">{new Date(userData.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Last Login</p>
                  <p className="text-sm">{userData.lastLogin}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Permissions</h4>
            <div className="flex flex-wrap gap-2">
              {userData.permissions.map((permission) => (
                <Badge key={permission} variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {permission.replace('_', ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onSave: (updatedData: UserData) => void;
}

export function EditUserModal({ isOpen, onClose, userData, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState<UserData>(userData);

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const handleInputChange = (field: keyof UserData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user information and permissions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          <Separator />

          <div>
            <Label className="text-base font-medium">Permissions</Label>
            <div className="mt-3 space-y-2">
              {['course_manage', 'student_grade', 'exam_conduct', 'admission_manage', 'document_verify', 'fee_collect', 'profile_edit', 'fee_pay', 'course_view', 'system_admin', 'user_manage'].map((permission) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('permissions', [...formData.permissions, permission]);
                      } else {
                        handleInputChange('permissions', formData.permissions.filter(p => p !== permission));
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm">{permission.replace('_', ' ').toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SuspendUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onSuspend: (userId: string, reason: string) => void;
}

export function SuspendUserModal({ isOpen, onClose, userData, onSuspend }: SuspendUserModalProps) {
  const [reason, setReason] = useState("");

  const handleSuspend = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for suspension");
      return;
    }
    onSuspend(userData.id, reason);
    onClose();
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-yellow-700">
            <Shield className="h-5 w-5" />
            Suspend User Account
          </DialogTitle>
          <DialogDescription>
            This action will suspend the user account and restrict access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">User Details</span>
            </div>
            <p className="text-sm text-yellow-700">
              <strong>Name:</strong> {userData.name}<br />
              <strong>Role:</strong> {userData.role}<br />
              <strong>Department:</strong> {userData.department}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Suspension *</Label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a detailed reason for suspending this user account..."
              className="w-full p-2 border rounded-md"
              rows={4}
              required
            />
          </div>

          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Warning:</strong> Suspending this user will immediately revoke their access to the system. 
              They will not be able to log in until the suspension is lifted.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleSuspend}>
            Suspend User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
