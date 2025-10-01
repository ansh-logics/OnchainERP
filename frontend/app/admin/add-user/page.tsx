"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { 
  UserPlus,
  Save,
  Upload,
  Eye,
  EyeOff,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building,
  Users,
  Shield,
  Camera,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function ManualAddUserPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    
    // Contact Information
    permanentAddress: "",
    currentAddress: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    
    // Academic/Professional Information
    userType: "",
    department: "",
    course: "",
    year: "",
    semester: "",
    rollNumber: "",
    designation: "",
    qualification: "",
    experience: "",
    joiningDate: "",
    
    // Login Credentials
    username: "",
    password: "",
    confirmPassword: "",
    
    // Additional Information
    fatherName: "",
    motherName: "",
    emergencyContact: "",
    emergencyRelation: "",
    aadharNumber: "",
    panNumber: "",
    
    // Preferences
    hostelRequired: false,
    transportRequired: false,
    libraryAccess: true,
    labAccess: false,
  });
  
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const departments = ["Computer Science", "Electronics", "Mechanical", "Civil", "Biotechnology"];
  const courses = ["B.Tech", "M.Tech", "MBA", "BBA", "BCA", "MCA"];
  const designations = ["Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Lab Assistant", "Administrative Staff"];

  return (
    <DashboardLayout title="Add User Manually" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Add User Manually</h2>
            <p className="text-muted-foreground">Create new user accounts with detailed information</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save User
            </Button>
          </div>
        </div>

        {/* User Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Type Selection
            </CardTitle>
            <CardDescription>Select the type of user account to create</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'student', label: 'Student', icon: GraduationCap, description: 'Student account with academic access' },
                { type: 'faculty', label: 'Faculty', icon: Users, description: 'Faculty member with teaching privileges' },
                { type: 'staff', label: 'Staff', icon: Building, description: 'Administrative staff account' }
              ].map((userType) => (
                <Card 
                  key={userType.type}
                  className={`cursor-pointer border-2 transition-colors ${
                    formData.userType === userType.type ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleInputChange('userType', userType.type)}
                >
                  <CardContent className="p-6 text-center">
                    <userType.icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="font-semibold mb-2">{userType.label}</h3>
                    <p className="text-sm text-gray-600">{userType.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {formData.userType && (
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="academic">Academic</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="additional">Additional</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Personal details and identification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <Camera className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 2MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="user@yukti.edu.in"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alternatePhone">Alternate Phone</Label>
                      <Input
                        id="alternatePhone"
                        type="tel"
                        value={formData.alternatePhone}
                        onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="dateOfBirth"
                          type="date"
                          className="pl-10"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Blood Group</Label>
                      <Select value={formData.bloodGroup} onValueChange={(value) => handleInputChange('bloodGroup', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A+">A+</SelectItem>
                          <SelectItem value="A-">A-</SelectItem>
                          <SelectItem value="B+">B+</SelectItem>
                          <SelectItem value="B-">B-</SelectItem>
                          <SelectItem value="AB+">AB+</SelectItem>
                          <SelectItem value="AB-">AB-</SelectItem>
                          <SelectItem value="O+">O+</SelectItem>
                          <SelectItem value="O-">O-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Address and location details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="permanentAddress">Permanent Address *</Label>
                    <Textarea
                      id="permanentAddress"
                      rows={3}
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      placeholder="Enter permanent address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentAddress">Current Address</Label>
                    <Textarea
                      id="currentAddress"
                      rows={3}
                      value={formData.currentAddress}
                      onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                      placeholder="Enter current address (if different)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pin Code *</Label>
                      <Input
                        id="pincode"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        placeholder="123456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="academic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic/Professional Information</CardTitle>
                  <CardDescription>Course, department, and role details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Department *</Label>
                      <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.userType === 'student' && (
                      <>
                        <div className="space-y-2">
                          <Label>Course *</Label>
                          <Select value={formData.course} onValueChange={(value) => handleInputChange('course', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select course" />
                            </SelectTrigger>
                            <SelectContent>
                              {courses.map((course) => (
                                <SelectItem key={course} value={course}>{course}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Academic Year *</Label>
                          <Select value={formData.year} onValueChange={(value) => handleInputChange('year', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">First Year</SelectItem>
                              <SelectItem value="2">Second Year</SelectItem>
                              <SelectItem value="3">Third Year</SelectItem>
                              <SelectItem value="4">Fourth Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Current Semester</Label>
                          <Select value={formData.semester} onValueChange={(value) => handleInputChange('semester', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">Semester 1</SelectItem>
                              <SelectItem value="2">Semester 2</SelectItem>
                              <SelectItem value="3">Semester 3</SelectItem>
                              <SelectItem value="4">Semester 4</SelectItem>
                              <SelectItem value="5">Semester 5</SelectItem>
                              <SelectItem value="6">Semester 6</SelectItem>
                              <SelectItem value="7">Semester 7</SelectItem>
                              <SelectItem value="8">Semester 8</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rollNumber">Roll Number *</Label>
                          <Input
                            id="rollNumber"
                            value={formData.rollNumber}
                            onChange={(e) => handleInputChange('rollNumber', e.target.value)}
                            placeholder="Enter roll number"
                          />
                        </div>
                      </>
                    )}

                    {(formData.userType === 'faculty' || formData.userType === 'staff') && (
                      <>
                        <div className="space-y-2">
                          <Label>Designation *</Label>
                          <Select value={formData.designation} onValueChange={(value) => handleInputChange('designation', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select designation" />
                            </SelectTrigger>
                            <SelectContent>
                              {designations.map((designation) => (
                                <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="qualification">Qualification</Label>
                          <Input
                            id="qualification"
                            value={formData.qualification}
                            onChange={(e) => handleInputChange('qualification', e.target.value)}
                            placeholder="Highest qualification"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="experience">Experience (Years)</Label>
                          <Input
                            id="experience"
                            type="number"
                            value={formData.experience}
                            onChange={(e) => handleInputChange('experience', e.target.value)}
                            placeholder="Years of experience"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="joiningDate">Joining Date *</Label>
                          <Input
                            id="joiningDate"
                            type="date"
                            value={formData.joiningDate}
                            onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Login Credentials</CardTitle>
                  <CardDescription>Username and password for system access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <p className="text-sm text-blue-800 font-medium">Security Guidelines</p>
                    </div>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Password must be at least 8 characters long</li>
                      <li>• Include uppercase, lowercase, numbers, and special characters</li>
                      <li>• Username should be unique across the system</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username *</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        placeholder="Enter username"
                      />
                    </div>
                    <div></div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Enter password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="sendCredentials" className="rounded" />
                    <label htmlFor="sendCredentials" className="text-sm">Send login credentials via email</label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Information</CardTitle>
                  <CardDescription>Family details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fatherName">Father's Name</Label>
                      <Input
                        id="fatherName"
                        value={formData.fatherName}
                        onChange={(e) => handleInputChange('fatherName', e.target.value)}
                        placeholder="Enter father's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="motherName">Mother's Name</Label>
                      <Input
                        id="motherName"
                        value={formData.motherName}
                        onChange={(e) => handleInputChange('motherName', e.target.value)}
                        placeholder="Enter mother's name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        type="tel"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelation">Relation</Label>
                      <Input
                        id="emergencyRelation"
                        value={formData.emergencyRelation}
                        onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                        placeholder="Father/Mother/Guardian"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="aadharNumber">Aadhar Number</Label>
                      <Input
                        id="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={(e) => handleInputChange('aadharNumber', e.target.value)}
                        placeholder="1234 5678 9012"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="panNumber">PAN Number</Label>
                      <Input
                        id="panNumber"
                        value={formData.panNumber}
                        onChange={(e) => handleInputChange('panNumber', e.target.value)}
                        placeholder="ABCDE1234F"
                      />
                    </div>
                  </div>

                  {formData.userType === 'student' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Service Preferences</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Hostel Accommodation</p>
                              <p className="text-sm text-gray-600">Require hostel accommodation</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={formData.hostelRequired}
                              onChange={(e) => handleInputChange('hostelRequired', e.target.checked)}
                              className="rounded" 
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Transport Service</p>
                              <p className="text-sm text-gray-600">Require transport facility</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={formData.transportRequired}
                              onChange={(e) => handleInputChange('transportRequired', e.target.checked)}
                              className="rounded" 
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Library Access</p>
                              <p className="text-sm text-gray-600">Access to library resources</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={formData.libraryAccess}
                              onChange={(e) => handleInputChange('libraryAccess', e.target.checked)}
                              className="rounded" 
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Lab Access</p>
                              <p className="text-sm text-gray-600">Access to department labs</p>
                            </div>
                            <input 
                              type="checkbox" 
                              checked={formData.labAccess}
                              onChange={(e) => handleInputChange('labAccess', e.target.checked)}
                              className="rounded" 
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Action Buttons */}
        {formData.userType && (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save and Create Account
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="h-4 w-4 mr-2" />
                  Save as Draft
                </Button>
                <Button variant="outline">
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
