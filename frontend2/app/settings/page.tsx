"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser, UserRole } from "@/lib/auth";
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Bell, 
  Palette, 
  Shield,
  Camera,
  Save,
  LogOut,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Download
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [settings, setSettings] = useState({
    // Profile settings
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@student.edu',
    phone: '+1 (555) 123-4567',
    studentId: 'STU2024001',
    department: 'Computer Science',
    semester: '5th Semester',
    
    // Notification preferences
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    examReminders: true,
    feeReminders: true,
    assignmentDeadlines: true,
    eventUpdates: false,
    
    // Appearance
    theme: 'light',
    language: 'English',
    timeZone: 'UTC-5',
    
    // Privacy & Security
    profileVisibility: 'friends',
    twoFactorAuth: false,
    sessionTimeout: '30',
    
    // Academic preferences
    defaultView: 'dashboard',
    showGrades: true,
    showAttendance: true,
    autoSync: true
  });

  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleSave = (section: string) => {
    // Mock save functionality
    console.log(`Saving ${section} settings:`, settings);
    // Here you would typically make an API call
  };

  const handleLogout = () => {
    localStorage.removeItem('yukti_user');
    router.push('/auth/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout title="Settings" userRole={user.role as UserRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and system preferences</p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className={`grid w-full ${user.role === 'admin' ? 'grid-cols-7' : 'grid-cols-5'}`}>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            {user.role === 'admin' && (
              <>
                <TabsTrigger value="system">System</TabsTrigger>
                <TabsTrigger value="institution">Institution</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-lg">
                      {settings.firstName[0]}{settings.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Camera className="h-4 w-4 mr-2" />
                      Change Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={settings.firstName}
                      onChange={(e) => setSettings({...settings, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={settings.lastName}
                      onChange={(e) => setSettings({...settings, lastName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({...settings, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={settings.phone}
                      onChange={(e) => setSettings({...settings, phone: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                {/* Academic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <div className="flex items-center gap-2">
                        <Input value={settings.studentId} disabled />
                        <Badge variant="secondary">Verified</Badge>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Input value={settings.department} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Current Semester</Label>
                      <Input value={settings.semester} disabled />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('profile')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Channels */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Channels</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label>Email Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.emailNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label>Push Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive push notifications on your devices</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.pushNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <Label>SMS Notifications</Label>
                          <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings.smsNotifications}
                        onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Notification Types */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Notification Types</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Exam Reminders</Label>
                        <p className="text-sm text-muted-foreground">Get notified about upcoming exams</p>
                      </div>
                      <Switch
                        checked={settings.examReminders}
                        onCheckedChange={(checked) => setSettings({...settings, examReminders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Fee Reminders</Label>
                        <p className="text-sm text-muted-foreground">Payment due date notifications</p>
                      </div>
                      <Switch
                        checked={settings.feeReminders}
                        onCheckedChange={(checked) => setSettings({...settings, feeReminders: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Assignment Deadlines</Label>
                        <p className="text-sm text-muted-foreground">Upcoming assignment due dates</p>
                      </div>
                      <Switch
                        checked={settings.assignmentDeadlines}
                        onCheckedChange={(checked) => setSettings({...settings, assignmentDeadlines: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Event Updates</Label>
                        <p className="text-sm text-muted-foreground">Campus events and announcements</p>
                      </div>
                      <Switch
                        checked={settings.eventUpdates}
                        onCheckedChange={(checked) => setSettings({...settings, eventUpdates: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('notifications')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Appearance & Display
                </CardTitle>
                <CardDescription>
                  Customize how the application looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={settings.theme} onValueChange={(value) => setSettings({...settings, theme: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Select value={settings.timeZone} onValueChange={(value) => setSettings({...settings, timeZone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                        <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                        <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                        <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('appearance')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                </CardTitle>
                <CardDescription>
                  Manage your privacy settings and account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select value={settings.profileVisibility} onValueChange={(value) => setSettings({...settings, profileVisibility: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Session Timeout</Label>
                    <Select value={settings.sessionTimeout} onValueChange={(value) => setSettings({...settings, sessionTimeout: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-red-600">Danger Zone</h3>
                  <div className="border border-red-200 rounded-lg p-4 space-y-4">
                    <div>
                      <h4 className="font-medium">Download Your Data</h4>
                      <p className="text-sm text-muted-foreground">Export all your personal data and information</p>
                      <Button variant="outline" className="mt-2">
                        <Download className="h-4 w-4 mr-2" />
                        Request Data Export
                      </Button>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-medium text-red-600">Sign Out All Devices</h4>
                      <p className="text-sm text-muted-foreground">This will sign you out of all devices except this one</p>
                      <Button variant="destructive" className="mt-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out All Devices
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Academic Preferences */}
          <TabsContent value="academic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Academic Preferences
                </CardTitle>
                <CardDescription>
                  Customize your academic dashboard and data display
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Default Dashboard View</Label>
                    <Select value={settings.defaultView} onValueChange={(value) => setSettings({...settings, defaultView: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dashboard">Overview Dashboard</SelectItem>
                        <SelectItem value="courses">My Courses</SelectItem>
                        <SelectItem value="calendar">Academic Calendar</SelectItem>
                        <SelectItem value="grades">Grade Book</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Grades on Dashboard</Label>
                      <p className="text-sm text-muted-foreground">Display your latest grades on the main dashboard</p>
                    </div>
                    <Switch
                      checked={settings.showGrades}
                      onCheckedChange={(checked) => setSettings({...settings, showGrades: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Attendance Summary</Label>
                      <p className="text-sm text-muted-foreground">Display attendance percentage on dashboard</p>
                    </div>
                    <Switch
                      checked={settings.showAttendance}
                      onCheckedChange={(checked) => setSettings({...settings, showAttendance: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-sync Data</Label>
                      <p className="text-sm text-muted-foreground">Automatically refresh academic data</p>
                    </div>
                    <Switch
                      checked={settings.autoSync}
                      onCheckedChange={(checked) => setSettings({...settings, autoSync: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('academic')}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings - Admin Only */}
          {user.role === 'admin' && (
            <TabsContent value="system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    System Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage system-wide settings and configurations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Maintenance Mode</Label>
                          <p className="text-sm text-muted-foreground">Put system in maintenance mode</p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Session Timeout (minutes)</Label>
                        <Input type="number" defaultValue="30" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Max Login Attempts</Label>
                        <Input type="number" defaultValue="3" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Backup Frequency</Label>
                        <Select defaultValue="daily">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Audit Logging</Label>
                          <p className="text-sm text-muted-foreground">Log all administrative actions</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Password Expiry (days)</Label>
                        <Input type="number" defaultValue="90" />
                      </div>
                      
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-800">Security Status</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                          System security level: <Badge className="bg-green-100 text-green-800">High</Badge>
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('system')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save System Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Institution Settings - Admin Only */}
          {user.role === 'admin' && (
            <TabsContent value="institution" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Institution Configuration
                  </CardTitle>
                  <CardDescription>
                    Manage institution-wide settings and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Institution Name</Label>
                        <Input defaultValue="OnchainERP College" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Institution Code</Label>
                        <Input defaultValue="OEC2024" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Academic Year</Label>
                        <Input defaultValue="2024-25" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Contact Phone</Label>
                        <Input defaultValue="+91 9876543210" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Official Email</Label>
                        <Input type="email" defaultValue="admin@onchainerp.edu" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Address</Label>
                        <textarea 
                          className="w-full p-2 border rounded-md"
                          rows={3}
                          defaultValue="123 Education Street, Knowledge City, KC 12345"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Website</Label>
                        <Input defaultValue="www.onchainerp.edu" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Established Year</Label>
                        <Input defaultValue="1995" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Semester System</Label>
                          <p className="text-sm text-muted-foreground">Use semester-based academic structure</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Minimum Attendance (%)</Label>
                        <Input type="number" defaultValue="75" />
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Financial Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Late Fee (%)</Label>
                        <Input type="number" defaultValue="2" />
                      </div>
                      <div className="space-y-2">
                        <Label>Grace Period (days)</Label>
                        <Input type="number" defaultValue="10" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Online Payments</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />
                  
                  <div className="flex justify-end">
                    <Button onClick={() => handleSave('institution')}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Institution Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
