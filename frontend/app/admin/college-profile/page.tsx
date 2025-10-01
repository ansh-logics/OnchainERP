"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { 
  fetchCollegeProfile, 
  updateCollegeProfile,
  CollegeProfile,
  handleApiError 
} from "@/lib/api";
import { 
  School,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  Award,
  Upload,
  Save,
  Edit,
  Building,
  Image
} from "lucide-react";

export default function CollegeProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [college, setCollege] = useState<CollegeProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    initializeCollegeProfile();
  }, [router]);

  const initializeCollegeProfile = async () => {
    try {
      // Check authentication first
      const currentUser = getCurrentUser();
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }
      
      if (currentUser.role !== 'admin') {
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);
      
      // Fetch college profile data
      const response = await fetchCollegeProfile();
      
      if (response.success && response.data) {
        setCollege(response.data);
      } else {
        console.error('Failed to fetch college profile:', response.error);
        setError(handleApiError(response.error));
        
        // Set fallback data if API fails
        setCollege({
          id: '1',
          name: "Yukti University",
          shortName: "YU",
          establishedYear: 1985,
          affiliatedUniversity: "UGC Autonomous",
          collegeType: "Private",
          registrationNumber: "YU001",
          addressStreet: "123 Education Street",
          addressCity: "Knowledge City",
          addressState: "State",
          addressPincode: "500001",
          addressCountry: "India",
          phone: "9123456789",
          email: "info@yuktiuniversity.edu.in",
          website: "www.yuktiuniversity.edu.in",
          primaryColor: "#2563eb",
          secondaryColor: "#4b5563",
          accentColor: "#059669",
          backgroundColor: "#f9fafb",
          motto: "",
          vision: "",
          mission: "",
          profileCompleted: false,
          setupStep: 1,
          isActive: true
        });
      }
      
    } catch (error) {
      console.error('College profile initialization error:', error);
      setError('Failed to load college profile data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading college data...</div>
      </div>
    );
  }

  const saveBrandingSettings = async () => {
    if (!college) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        primaryColor: college.primaryColor,
        secondaryColor: college.secondaryColor,
        accentColor: college.accentColor,
        backgroundColor: college.backgroundColor,
        logo: college.logo,
        motto: college.motto,
        vision: college.vision,
        mission: college.mission
      };

      const response = await updateCollegeProfile(updateData);
      
      if (response.success && response.data) {
        setCollege(response.data);
        alert('Branding settings saved successfully!');
      } else {
        console.error('Failed to save branding settings:', response.error);
        alert('Failed to save branding settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving branding settings:', error);
      alert('Failed to save branding settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateCollegeField = (field: keyof CollegeProfile, value: any) => {
    if (!college) return;
    setCollege(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <DashboardLayout title="College Profile" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">College Profile</h2>
            <p className="text-muted-foreground">Manage institutional information and settings</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="contact">Contact Details</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  Institution Information
                </CardTitle>
                <CardDescription>Basic details about your institution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="collegeName">College Name</Label>
                    <Input 
                      id="collegeName"
                      value={college.name}
                      onChange={(e) => updateCollegeField('name', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input 
                      id="establishedYear"
                      value={college.establishedYear.toString()}
                      onChange={(e) => updateCollegeField('establishedYear', parseInt(e.target.value) || 0)}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="affiliation">Affiliation</Label>
                    <Input 
                      id="affiliation"
                      value={college.affiliatedUniversity || ''}
                      onChange={(e) => updateCollegeField('affiliatedUniversity', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accreditation">Accreditation</Label>
                    <Input 
                      id="accreditation"
                      value="NAAC A+ Grade"
                      onChange={() => {}}
                      disabled={true}
                      className="bg-gray-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description"
                    rows={4}
                    value={college.mission || ''}
                    onChange={(e) => updateCollegeField('mission', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? "" : "bg-gray-50"}
                  />
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Communication and location details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address</Label>
                  <Textarea 
                    id="address"
                    rows={3}
                    value={college.addressStreet || ''}
                    onChange={(e) => updateCollegeField('addressStreet', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? "" : "bg-gray-50"}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                      <Phone className="h-4 w-4 mt-3 mr-2 text-gray-500" />
                      <Input 
                        id="phone"
                        value={college.phone || ''}
                        onChange={(e) => updateCollegeField('phone', e.target.value)}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-gray-50"}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex">
                      <Mail className="h-4 w-4 mt-3 mr-2 text-gray-500" />
                      <Input 
                        id="email"
                        value={college.email || ''}
                        onChange={(e) => updateCollegeField('email', e.target.value)}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-gray-50"}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="flex">
                      <Globe className="h-4 w-4 mt-3 mr-2 text-gray-500" />
                      <Input 
                        id="website"
                        value={college.website || ''}
                        onChange={(e) => updateCollegeField('website', e.target.value)}
                        disabled={!isEditing}
                        className={isEditing ? "" : "bg-gray-50"}
                      />
                    </div>
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Students</p>
                      <p className="text-2xl font-bold">1,250</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Faculty</p>
                      <p className="text-2xl font-bold">85</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Departments</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <Building className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Since</p>
                      <p className="text-2xl font-bold">{college.establishedYear}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Accreditation & Recognition</CardTitle>
                <CardDescription>Awards and certifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">NAAC A+ Grade</Badge>
                  <Badge className="bg-blue-100 text-blue-800">ISO 9001:2015 Certified</Badge>
                  <Badge className="bg-green-100 text-green-800">Best College Award 2023</Badge>
                  <Badge className="bg-purple-100 text-purple-800">UGC Recognized</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Logo & Branding
                </CardTitle>
                <CardDescription>Manage institutional visual identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>College Logo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 mb-4">Upload your college logo</p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Letterhead Template</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-sm text-gray-500 mb-4">Upload letterhead template</p>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose File
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>College Identity</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Motto</Label>
                      <Input 
                        value={college.motto || ''} 
                        onChange={(e) => updateCollegeField('motto', e.target.value)}
                        placeholder="Enter college motto" 
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Vision Statement</Label>
                      <Textarea 
                        value={college.vision || ''} 
                        onChange={(e) => updateCollegeField('vision', e.target.value)}
                        placeholder="Enter college vision statement"
                        className="min-h-[80px]"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Mission Statement</Label>
                      <Textarea 
                        value={college.mission || ''} 
                        onChange={(e) => updateCollegeField('mission', e.target.value)}
                        placeholder="Enter college mission statement"
                        className="min-h-[80px]"
                        readOnly={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Color Scheme</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Primary Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded border"></div>
                        <Input 
                          value={college.primaryColor || '#3b82f6'} 
                          onChange={(e) => updateCollegeField('primaryColor', e.target.value)}
                          className="text-sm" 
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-600 rounded border"></div>
                        <Input 
                          value={college.secondaryColor || '#6b7280'} 
                          onChange={(e) => updateCollegeField('secondaryColor', e.target.value)}
                          className="text-sm" 
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-600 rounded border"></div>
                        <Input 
                          value={college.accentColor || '#f59e0b'} 
                          onChange={(e) => updateCollegeField('accentColor', e.target.value)}
                          className="text-sm" 
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Background Color</Label>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-50 rounded border"></div>
                        <Input 
                          value={college.backgroundColor || '#ffffff'} 
                          onChange={(e) => updateCollegeField('backgroundColor', e.target.value)}
                          className="text-sm" 
                          readOnly={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={saveBrandingSettings} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Branding Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
