"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/lib/auth";
import { 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  BookOpen,
  Building,
  Edit,
  Save,
  AlertCircle,
  FileText,
  Star,
  TrendingUp
} from "lucide-react";

interface FacultyProfile {
  personalInfo: {
    id: string;
    name: string;
    email: string;
    phone: string;
    alternateEmail?: string;
    profilePicture?: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup: string;
    nationality: string;
    maritalStatus: string;
  };
  professionalInfo: {
    employeeId: string;
    designation: string;
    department: {
      id: string;
      name: string;
      code: string;
    };
    college: {
      id: string;
      name: string;
      shortName: string;
    };
    joiningDate: string;
    experience: {
      totalYears: number;
      industryYears: number;
      academicYears: number;
      currentInstitution: number;
    };
    employmentType: string;
    salary: {
      basic: number;
      allowances: number;
      total: number;
      currency: string;
    };
  };
  academicInfo: {
    qualifications: Array<{
      degree: string;
      field: string;
      university: string;
      year: number;
      grade: string;
      specialization: string;
    }>;
    specializations: string[];
    researchAreas: string[];
    publications: {
      journals: number;
      conferences: number;
      bookChapters: number;
      patents: number;
      hIndex: number;
      totalCitations: number;
    };
  };
  addressInfo: {
    current: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
    permanent: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      country: string;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
  };
  currentAssignments: {
    courses: number;
    sections: number;
    totalStudents: number;
    adminRoles: string[];
    committees: string[];
  };
  achievements: Array<{
    title: string;
    year: number;
    organization: string;
    description: string;
  }>;
  recentProjects: Array<{
    id: string;
    title: string;
    status: string;
    startDate: string;
    expectedEndDate?: string;
    endDate?: string;
    fundingAgency: string;
    amount: number;
    role: string;
  }>;
}

export default function FacultyProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<FacultyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }

    if (currentUser.role !== 'faculty') {
      router.push('/');
      return;
    }

    setUser(currentUser);
    fetchProfileData();
  }, [router]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/faculty/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch profile data');
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err);
      setError(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading || !user) {
    return (
      <DashboardLayout title="My Profile" userRole="faculty">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Profile" userRole="faculty">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button 
              variant="outline" 
              onClick={fetchProfileData}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!profileData) {
    return (
      <DashboardLayout title="My Profile" userRole="faculty">
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No profile data available</p>
            </div>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  const { personalInfo, professionalInfo, academicInfo, addressInfo, emergencyContact, currentAssignments, achievements, recentProjects } = profileData;

  return (
    <DashboardLayout title="My Profile" userRole="faculty">
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={personalInfo.profilePicture} alt={personalInfo.name} />
                <AvatarFallback className="text-2xl">
                  {personalInfo.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">{personalInfo.name}</h2>
                    <p className="text-xl text-muted-foreground mt-1">{professionalInfo.designation}</p>
                    <p className="text-lg text-muted-foreground">
                      {professionalInfo.department.name} • {professionalInfo.college.shortName}
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <Badge variant="secondary" className="px-3 py-1">
                        ID: {professionalInfo.employeeId}
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        {professionalInfo.experience.totalYears} years experience
                      </Badge>
                      <Badge variant="outline" className="px-3 py-1">
                        {professionalInfo.employmentType}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button variant="outline" onClick={() => setEditing(!editing)}>
                    {editing ? (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Basic personal details and identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input value={personalInfo.name} readOnly={!editing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input value={formatDate(personalInfo.dateOfBirth)} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Input value={personalInfo.gender} readOnly={!editing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Group</Label>
                    <Input value={personalInfo.bloodGroup} readOnly={!editing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Input value={personalInfo.nationality} readOnly={!editing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Marital Status</Label>
                    <Input value={personalInfo.maritalStatus} readOnly={!editing} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                  <CardDescription>Current position and employment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input value={professionalInfo.employeeId} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input value={professionalInfo.designation} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={professionalInfo.department.name} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Joining Date</Label>
                    <Input value={formatDate(professionalInfo.joiningDate)} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Employment Type</Label>
                    <Input value={professionalInfo.employmentType} readOnly />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Experience & Assignments</CardTitle>
                  <CardDescription>Professional experience and current responsibilities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-2">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{professionalInfo.experience.totalYears}</p>
                      <p className="text-sm text-muted-foreground">Total Experience</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{professionalInfo.experience.academicYears}</p>
                      <p className="text-sm text-muted-foreground">Academic Years</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{currentAssignments.courses}</p>
                      <p className="text-sm text-muted-foreground">Active Courses</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{currentAssignments.totalStudents}</p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label>Administrative Roles</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentAssignments.adminRoles.map((role, idx) => (
                          <Badge key={idx} variant="secondary">{role}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Committee Memberships</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentAssignments.committees.map((committee, idx) => (
                          <Badge key={idx} variant="outline">{committee}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="academic" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Qualifications</CardTitle>
                  <CardDescription>Educational background and degrees</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {academicInfo.qualifications.map((qual, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                        <GraduationCap className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{qual.degree} in {qual.field}</h4>
                          <p className="text-muted-foreground">{qual.university}</p>
                          <p className="text-sm text-muted-foreground">
                            {qual.year} • {qual.grade} • {qual.specialization}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Specializations</CardTitle>
                    <CardDescription>Areas of expertise</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {academicInfo.specializations.map((spec, idx) => (
                        <Badge key={idx} variant="secondary">{spec}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Research Areas</CardTitle>
                    <CardDescription>Current research interests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {academicInfo.researchAreas.map((area, idx) => (
                        <Badge key={idx} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Primary contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input value={personalInfo.email} readOnly={!editing} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Alternate Email</Label>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <Input value={personalInfo.alternateEmail || ''} readOnly={!editing} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <Input value={personalInfo.phone} readOnly={!editing} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                  <CardDescription>Emergency contact person details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={emergencyContact.name} readOnly={!editing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Relationship</Label>
                    <Input value={emergencyContact.relationship} readOnly={!editing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={emergencyContact.phone} readOnly={!editing} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={emergencyContact.email} readOnly={!editing} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>Current and permanent addresses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="font-medium mb-3">Current Address</h4>
                    <div className="space-y-2 text-sm">
                      <p>{addressInfo.current.street}</p>
                      <p>{addressInfo.current.city}, {addressInfo.current.state} - {addressInfo.current.pincode}</p>
                      <p>{addressInfo.current.country}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-3">Permanent Address</h4>
                    <div className="space-y-2 text-sm">
                      <p>{addressInfo.permanent.street}</p>
                      <p>{addressInfo.permanent.city}, {addressInfo.permanent.state} - {addressInfo.permanent.pincode}</p>
                      <p>{addressInfo.permanent.country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Awards</CardTitle>
                <CardDescription>Recognition and accomplishments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.map((achievement, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                      <Award className="h-6 w-6 text-yellow-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-muted-foreground">{achievement.organization}</p>
                            <p className="text-sm text-muted-foreground mt-1">{achievement.description}</p>
                          </div>
                          <Badge variant="outline">{achievement.year}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Publications Overview</CardTitle>
                  <CardDescription>Research output and impact metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{academicInfo.publications.journals}</p>
                      <p className="text-sm text-muted-foreground">Journal Papers</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{academicInfo.publications.conferences}</p>
                      <p className="text-sm text-muted-foreground">Conference Papers</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{academicInfo.publications.hIndex}</p>
                      <p className="text-sm text-muted-foreground">H-Index</p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">{academicInfo.publications.totalCitations}</p>
                      <p className="text-sm text-muted-foreground">Total Citations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Additional Publications</CardTitle>
                  <CardDescription>Other research contributions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Book Chapters</span>
                    <Badge variant="secondary">{academicInfo.publications.bookChapters}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Patents</span>
                    <Badge variant="secondary">{academicInfo.publications.patents}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Research Projects</CardTitle>
                <CardDescription>Current and completed research projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <FileText className="h-6 w-6 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{project.title}</h4>
                            <p className="text-muted-foreground">{project.fundingAgency}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {project.role} • {formatCurrency(project.amount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : project.expectedEndDate ? formatDate(project.expectedEndDate) : 'Ongoing'}
                            </p>
                          </div>
                          <Badge variant={project.status === 'Completed' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
