"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
  fetchCollegeStatistics,
  CollegeProfile,
  CollegeStatistics,
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
  Image,
  AlertCircle
} from "lucide-react";

export default function CollegeProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [college, setCollege] = useState<CollegeProfile | null>(null);
  const [statistics, setStatistics] = useState<CollegeStatistics | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingLetterhead, setUploadingLetterhead] = useState(false);
  const router = useRouter();

  const loadCollegeStatistics = async (collegeId?: string) => {
    setStatsLoading(true);
    try {
      const response = await fetchCollegeStatistics(collegeId);
      if (response.success && response.data) {
        setStatistics(response.data);
      } else {
        console.error('Failed to fetch college statistics:', response.error);
        // Only set empty statistics if it's a "no data" situation, not a server error
        if (response.error?.includes('College ID not found') || response.error?.includes('not found')) {
          setStatistics({
            totalDepartments: 0,
            totalStudents: 0,
            totalFaculty: 0,
            establishedYear: 0,
            campusArea: 0,
            totalBuildings: 0,
            totalClassrooms: 0,
            totalLaboratories: 0,
          });
        } else {
          // For server errors, don't set fallback data
          setStatistics(null);
        }
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatistics(null);
    } finally {
      setStatsLoading(false);
    }
  };

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
      
      // Fetch college profile data using collegeId from user or setup-status
      let collegeIdToFetch;
      if (currentUser.collegeId) {
        collegeIdToFetch = typeof currentUser.collegeId === 'object' ? (currentUser.collegeId as any)?.id : currentUser.collegeId;
      } else if (currentUser.college?.id) {
        collegeIdToFetch = currentUser.college.id;
      }
      
      // If no collegeId in user object, fetch from setup-status first
      if (!collegeIdToFetch) {
        const setupResponse = await fetch('/api/colleges/setup-status', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (setupResponse.ok) {
          const setupData = await setupResponse.json();
          collegeIdToFetch = setupData.data?.college?.id;
        }
      }
      
      // Now fetch full college profile
      const response = await fetchCollegeProfile(collegeIdToFetch);
      
      if (response.success && response.data) {
        setCollege(response.data);
        // Also fetch statistics for this college using the college ID from the response
        await loadCollegeStatistics(response.data.id);
      } else {
        console.error('Failed to fetch college profile:', response.error);
        setError(handleApiError(response.error));
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

  const saveBasicInfo = async () => {
    if (!college) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        name: college.name,
        establishedYear: college.establishedYear,
        affiliatedUniversity: college.affiliatedUniversity,
        mission: college.mission
      };

      const response = await updateCollegeProfile(updateData, college.id);
      
      if (response.success && response.data) {
        setCollege(response.data);
        setIsEditing(false);
        toast.success('Basic information saved successfully!');
      } else {
        console.error('Failed to save basic info:', response.error);
        toast.error('Failed to save basic information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving basic info:', error);
      toast.error('Failed to save basic information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const saveContactInfo = async () => {
    if (!college) return;
    
    setIsSaving(true);
    try {
      const updateData = {
        addressStreet: college.addressStreet,
        phone: college.phone,
        email: college.email,
        website: college.website
      };

      const response = await updateCollegeProfile(updateData, college.id);
      
      if (response.success && response.data) {
        setCollege(response.data);
        setIsEditing(false);
        toast.success('Contact information saved successfully!');
      } else {
        console.error('Failed to save contact info:', response.error);
        toast.error('Failed to save contact information. Please try again.');
      }
    } catch (error) {
      console.error('Error saving contact info:', error);
      toast.error('Failed to save contact information. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
        letterhead: college.letterhead,
        motto: college.motto,
        vision: college.vision,
        mission: college.mission
      };

      const response = await updateCollegeProfile(updateData, college.id);
      
      if (response.success && response.data) {
        setCollege(response.data);
        toast.success('Branding settings saved successfully!');
      } else {
        console.error('Failed to save branding settings:', response.error);
        toast.error('Failed to save branding settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving branding settings:', error);
      toast.error('Failed to save branding settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateCollegeField = (field: keyof CollegeProfile, value: any) => {
    if (!college) return;
    setCollege(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'letterhead') => {
    if (!college) return;

    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingLetterhead;
    setUploading(true);

    try {
      // Additional validation
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      const allowedLetterheadTypes = [...allowedImageTypes, 'application/pdf'];
      
      const allowedTypes = type === 'logo' ? allowedImageTypes : allowedLetterheadTypes;

      if (!allowedTypes.includes(file.type)) {
        toast.error(`Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')}`);
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('collegeId', college.id);

      const response = await fetch('/api/upload/college-assets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          updateCollegeField(type === 'logo' ? 'logo' : 'letterhead', result.data.fileUrl);
          toast.success(`${type === 'logo' ? 'Logo' : 'Letterhead'} uploaded successfully!`);
        } else {
          throw new Error(result.message || 'Upload failed');
        }
      } else {
        const errorResult = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorResult.message || 'Upload failed');
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}. ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileUpload = (type: 'logo' | 'letterhead') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'logo' ? 'image/*' : 'image/*,application/pdf';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file, type);
      }
    };
    input.click();
  };

  const validateColorInput = (value: string): boolean => {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(value);
  };

  const handleColorChange = (field: keyof CollegeProfile, value: string) => {
    if (validateColorInput(value) || value === '') {
      updateCollegeField(field, value);
    } else {
      toast.error('Please enter a valid hex color code (e.g., #3b82f6)');
    }
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

        <Tabs defaultValue="basic" className="space-y-6" onValueChange={(value) => {
          if (value === 'statistics' && !statistics && college?.id) {
            loadCollegeStatistics(college.id);
          }
        }}>
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
                      value={college.name || ''}
                      onChange={(e) => updateCollegeField('name', e.target.value)}
                      disabled={!isEditing}
                      className={isEditing ? "" : "bg-gray-50"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input 
                      id="establishedYear"
                      value={college.establishedYear?.toString() || ''}
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
                    <Button onClick={saveBasicInfo} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
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
                    <Button onClick={saveContactInfo} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Changes'}
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
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg">Loading statistics...</div>
              </div>
            ) : statistics && (statistics.totalStudents > 0 || statistics.totalFaculty > 0 || statistics.totalDepartments > 0) ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Total Students</p>
                          <p className="text-2xl font-bold">{statistics.totalStudents}</p>
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
                          <p className="text-2xl font-bold">{statistics.totalFaculty}</p>
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
                          <p className="text-2xl font-bold">{statistics.totalDepartments}</p>
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
                          <p className="text-2xl font-bold">{statistics.establishedYear}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {statistics.campusArea || statistics.totalBuildings || statistics.totalClassrooms || statistics.totalLaboratories ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Infrastructure Details</CardTitle>
                      <CardDescription>Physical infrastructure and facilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {statistics.campusArea && (
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Campus Area</p>
                            <p className="text-xl font-bold">{statistics.campusArea} acres</p>
                          </div>
                        )}
                        {statistics.totalBuildings && (
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Buildings</p>
                            <p className="text-xl font-bold">{statistics.totalBuildings}</p>
                          </div>
                        )}
                        {statistics.totalClassrooms && (
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Classrooms</p>
                            <p className="text-xl font-bold">{statistics.totalClassrooms}</p>
                          </div>
                        )}
                        {statistics.totalLaboratories && (
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Laboratories</p>
                            <p className="text-xl font-bold">{statistics.totalLaboratories}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}

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
              </>
            ) : statistics === null ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-16 w-16 text-red-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Statistics</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    There was an error loading the college statistics. This might be due to a server issue.
                    Please try refreshing or contact support if the problem persists.
                  </p>
                  <Button className="mt-4" onClick={() => loadCollegeStatistics(college?.id)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building className="h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Statistics Available</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Statistics will appear here once you have added departments, faculty, and students to your college.
                    Start by setting up your college structure in the administration panel.
                  </p>
                  <Button className="mt-4" onClick={() => loadCollegeStatistics(college?.id)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Refresh Statistics
                  </Button>
                </CardContent>
              </Card>
            )}
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
                      {college.logo ? (
                        <div className="space-y-4">
                          <img 
                            src={college.logo} 
                            alt="College Logo" 
                            className="h-24 w-24 mx-auto object-contain rounded-lg"
                          />
                          <p className="text-sm text-green-600">Logo uploaded successfully</p>
                        </div>
                      ) : (
                        <>
                          <School className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-sm text-gray-500 mb-4">Upload your college logo</p>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => triggerFileUpload('logo')}
                        disabled={uploadingLogo}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingLogo ? 'Uploading...' : (college.logo ? 'Change Logo' : 'Choose File')}
                      </Button>
                      {college.logo && (
                        <p className="text-xs text-gray-500 mt-2">
                          Accepted formats: JPG, PNG, GIF, WebP (Max 5MB)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Letterhead Template</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      {college.letterhead ? (
                        <div className="space-y-4">
                          {college.letterhead?.endsWith('.pdf') ? (
                            <div className="h-24 w-24 mx-auto bg-red-100 rounded-lg flex items-center justify-center">
                              <span className="text-red-600 font-medium text-xs">PDF</span>
                            </div>
                          ) : (
                            <img 
                              src={college.letterhead} 
                              alt="Letterhead Template" 
                              className="h-24 w-24 mx-auto object-contain rounded-lg"
                            />
                          )}
                          <p className="text-sm text-green-600">Letterhead uploaded successfully</p>
                        </div>
                      ) : (
                        <>
                          <Image className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-sm text-gray-500 mb-4">Upload letterhead template</p>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        onClick={() => triggerFileUpload('letterhead')}
                        disabled={uploadingLetterhead}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploadingLetterhead ? 'Uploading...' : (college.letterhead ? 'Change Letterhead' : 'Choose File')}
                      </Button>
                      {!college.letterhead && (
                        <p className="text-xs text-gray-500 mt-2">
                          Accepted formats: JPG, PNG, GIF, WebP, PDF (Max 5MB)
                        </p>
                      )}
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
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: college.primaryColor || '#3b82f6' }}
                        ></div>
                        <Input 
                          type="color"
                          value={college.primaryColor || '#3b82f6'} 
                          onChange={(e) => updateCollegeField('primaryColor', e.target.value)}
                          className="text-sm w-20" 
                          disabled={!isEditing}
                        />
                        <Input 
                          value={college.primaryColor || '#3b82f6'} 
                          onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                          className="text-sm flex-1" 
                          readOnly={!isEditing}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Secondary Color</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: college.secondaryColor || '#6b7280' }}
                        ></div>
                        <Input 
                          type="color"
                          value={college.secondaryColor || '#6b7280'} 
                          onChange={(e) => updateCollegeField('secondaryColor', e.target.value)}
                          className="text-sm w-20" 
                          disabled={!isEditing}
                        />
                        <Input 
                          value={college.secondaryColor || '#6b7280'} 
                          onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                          className="text-sm flex-1" 
                          readOnly={!isEditing}
                          placeholder="#6b7280"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Accent Color</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: college.accentColor || '#f59e0b' }}
                        ></div>
                        <Input 
                          type="color"
                          value={college.accentColor || '#f59e0b'} 
                          onChange={(e) => updateCollegeField('accentColor', e.target.value)}
                          className="text-sm w-20" 
                          disabled={!isEditing}
                        />
                        <Input 
                          value={college.accentColor || '#f59e0b'} 
                          onChange={(e) => handleColorChange('accentColor', e.target.value)}
                          className="text-sm flex-1" 
                          readOnly={!isEditing}
                          placeholder="#f59e0b"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Background Color</Label>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded border border-gray-300"
                          style={{ backgroundColor: college.backgroundColor || '#ffffff' }}
                        ></div>
                        <Input 
                          type="color"
                          value={college.backgroundColor || '#ffffff'} 
                          onChange={(e) => updateCollegeField('backgroundColor', e.target.value)}
                          className="text-sm w-20" 
                          disabled={!isEditing}
                        />
                        <Input 
                          value={college.backgroundColor || '#ffffff'} 
                          onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
                          className="text-sm flex-1" 
                          readOnly={!isEditing}
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color Scheme Preview */}
                <div className="space-y-4">
                  <Label>Color Scheme Preview</Label>
                  <div className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Header Example</span>
                      <div 
                        className="px-4 py-2 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: college.primaryColor || '#3b82f6' }}
                      >
                        Primary Color
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Secondary Element</span>
                      <div 
                        className="px-4 py-2 rounded text-white text-sm"
                        style={{ backgroundColor: college.secondaryColor || '#6b7280' }}
                      >
                        Secondary Color
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Accent/Button</span>
                      <div 
                        className="px-4 py-2 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: college.accentColor || '#f59e0b' }}
                      >
                        Accent Color
                      </div>
                    </div>
                    <div 
                      className="p-4 rounded border text-sm"
                      style={{ backgroundColor: college.backgroundColor || '#ffffff' }}
                    >
                      Background Color Preview - This shows how content will look on your chosen background
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
