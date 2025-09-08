"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  School,
  Users,
  Mail,
  Shield,
  Database,
  Bell,
  Palette,
  Globe,
  Save,
  AlertTriangle
} from "lucide-react"

export function AdminSettings() {
  const [settings, setSettings] = useState({
    // College Information
    collegeName: "Sample College of Technology",
    collegeCode: "SCT",
    address: "123 Education Street, Learning City",
    phone: "+1-234-567-8900",
    email: "admin@samplecollege.edu",
    website: "www.samplecollege.edu",
    
    // Academic Settings
    currentAcademicYear: "2024-2025",
    semesterSystem: "2-semester",
    gradingSystem: "CGPA",
    passingGrade: "50",
    
    // User Management
    allowSelfRegistration: false,
    requireEmailVerification: true,
    defaultUserRole: "student",
    passwordMinLength: "8",
    sessionTimeout: "30",
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
    maintenanceMode: false,
    
    // System
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    language: "English",
    theme: "light",
    
    // Backup
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: "30"
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log("Settings saved:", settings)
      alert("Settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">Configure your college management system</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* College Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              College Information
            </CardTitle>
            <CardDescription>Basic information about your institution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collegeName">College Name</Label>
                <Input
                  id="collegeName"
                  value={settings.collegeName}
                  onChange={(e) => handleSettingChange("collegeName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="collegeCode">College Code</Label>
                <Input
                  id="collegeCode"
                  value={settings.collegeCode}
                  onChange={(e) => handleSettingChange("collegeCode", e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) => handleSettingChange("address", e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={settings.phone}
                  onChange={(e) => handleSettingChange("phone", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleSettingChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={settings.website}
                  onChange={(e) => handleSettingChange("website", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Academic Settings
            </CardTitle>
            <CardDescription>Configure academic year and grading system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="academicYear">Current Academic Year</Label>
                <Input
                  id="academicYear"
                  value={settings.currentAcademicYear}
                  onChange={(e) => handleSettingChange("currentAcademicYear", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semesterSystem">Semester System</Label>
                <Select value={settings.semesterSystem} onValueChange={(value) => handleSettingChange("semesterSystem", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2-semester">2 Semester</SelectItem>
                    <SelectItem value="3-semester">3 Semester (Trimester)</SelectItem>
                    <SelectItem value="4-semester">4 Semester (Quarter)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gradingSystem">Grading System</Label>
                <Select value={settings.gradingSystem} onValueChange={(value) => handleSettingChange("gradingSystem", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CGPA">CGPA (10 Point)</SelectItem>
                    <SelectItem value="GPA">GPA (4 Point)</SelectItem>
                    <SelectItem value="Percentage">Percentage</SelectItem>
                    <SelectItem value="Letter">Letter Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passingGrade">Minimum Passing Grade</Label>
                <Input
                  id="passingGrade"
                  value={settings.passingGrade}
                  onChange={(e) => handleSettingChange("passingGrade", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Management & Security
            </CardTitle>
            <CardDescription>Configure user registration and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Self Registration</Label>
                <div className="text-sm text-muted-foreground">Allow users to register themselves</div>
              </div>
              <Switch
                checked={settings.allowSelfRegistration}
                onCheckedChange={(checked) => handleSettingChange("allowSelfRegistration", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Email Verification</Label>
                <div className="text-sm text-muted-foreground">Users must verify email before login</div>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => handleSettingChange("requireEmailVerification", checked)}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultRole">Default User Role</Label>
                <Select value={settings.defaultUserRole} onValueChange={(value) => handleSettingChange("defaultUserRole", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordLength">Password Min Length</Label>
                <Input
                  id="passwordLength"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleSettingChange("passwordMinLength", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications & Alerts
            </CardTitle>
            <CardDescription>Configure system notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-muted-foreground">Send notifications via email</div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <div className="text-sm text-muted-foreground">Send notifications via SMS</div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Alerts</Label>
                <div className="text-sm text-muted-foreground">Show system alerts and warnings</div>
              </div>
              <Switch
                checked={settings.systemAlerts}
                onCheckedChange={(checked) => handleSettingChange("systemAlerts", checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Maintenance Mode
                </Label>
                <div className="text-sm text-muted-foreground">Put system in maintenance mode</div>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              System Preferences
            </CardTitle>
            <CardDescription>Configure system display and behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingChange("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(value) => handleSettingChange("dateFormat", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Spanish">Spanish</SelectItem>
                    <SelectItem value="French">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange("theme", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup & Data Management
            </CardTitle>
            <CardDescription>Configure automatic backups</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <div className="text-sm text-muted-foreground">Automatically backup system data</div>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select value={settings.backupFrequency} onValueChange={(value) => handleSettingChange("backupFrequency", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backupRetention">Retention (days)</Label>
                <Input
                  id="backupRetention"
                  type="number"
                  value={settings.backupRetention}
                  onChange={(e) => handleSettingChange("backupRetention", e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Create Backup Now
              </Button>
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Restore from Backup
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
