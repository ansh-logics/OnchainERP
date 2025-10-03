"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { getHostels, type HostelData } from "@/lib/api";
import { 
  Search,
  Building,
  BedDouble,
  Users, 
  CheckCircle,
  AlertCircle,
  Filter,
  Download,
  RefreshCcw,
  Home,
  MapPin
} from "lucide-react";

export default function StaffHostelPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [hostels, setHostels] = useState<HostelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || (currentUser.role !== 'staff' && currentUser.role !== 'faculty')) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadHostels();
  }, [router]);

  const loadHostels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getHostels({});
      
      if (response.success && response.data) {
        setHostels(response.data);
      } else {
        setError(response.message || 'Failed to load hostels');
      }
    } catch (err) {
      console.error('Error loading hostels:', err);
      setError('An error occurred while loading hostels');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const filteredHostels = hostels.filter(hostel => {
    const matchesSearch = hostel.hostelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hostel.hostelCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'male') return matchesSearch && hostel.gender === 'Male';
    if (selectedTab === 'female') return matchesSearch && hostel.gender === 'Female';
    
    return matchesSearch;
  });

  const stats = {
    total: hostels.length,
    totalCapacity: hostels.reduce((sum, h) => sum + h.totalCapacity, 0),
    totalOccupancy: hostels.reduce((sum, h) => sum + h.currentOccupancy, 0),
    maleHostels: hostels.filter(h => h.gender === 'Male').length,
    femaleHostels: hostels.filter(h => h.gender === 'Female').length,
  };

  const occupancyRate = stats.totalCapacity > 0 
    ? Math.round((stats.totalOccupancy / stats.totalCapacity) * 100) 
    : 0;

  return (
    <DashboardLayout title="Hostel Management" userRole={(user.role === 'faculty' ? 'faculty' : 'staff') as 'faculty'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Hostel Management</h2>
            <p className="text-gray-600">Manage hostel accommodations and room allocations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadHostels}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <BedDouble className="h-4 w-4 mr-2" />
              Allocate Room
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <p>{error}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadHostels}
                className="mt-4"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">Total Hostels</CardTitle>
                <Building className="h-4 w-4 text-gray-600" />
                </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-600">Total Capacity</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.totalCapacity}</div>
              <p className="text-xs text-gray-600 mt-1">Available beds</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-600">Occupied</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalOccupancy}</div>
              <p className="text-xs text-gray-600 mt-1">{occupancyRate}% occupancy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-indigo-600">Male Hostels</CardTitle>
                <Home className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{stats.maleHostels}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-pink-600">Female Hostels</CardTitle>
                <Home className="h-4 w-4 text-pink-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-600">{stats.femaleHostels}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                  placeholder="Search by hostel name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Hostels List */}
        <Card>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <CardHeader>
          <TabsList>
                <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
                <TabsTrigger value="male">Male ({stats.maleHostels})</TabsTrigger>
                <TabsTrigger value="female">Female ({stats.femaleHostels})</TabsTrigger>
          </TabsList>
              </CardHeader>
              <CardContent>
              {loading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading hostels...</p>
                          </div>
              ) : filteredHostels.length === 0 ? (
                <div className="py-12 text-center">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No hostels found</p>
                  {searchTerm && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchTerm('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                          </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHostels.map((hostel) => {
                    const hostelOccupancy = hostel.totalCapacity > 0 
                      ? Math.round((hostel.currentOccupancy / hostel.totalCapacity) * 100) 
                      : 0;
                    
                    return (
                      <Card key={hostel.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                hostel.gender === 'Male' ? 'bg-blue-100' : 'bg-pink-100'
                              }`}>
                                <Building className={`h-6 w-6 ${
                                  hostel.gender === 'Male' ? 'text-blue-600' : 'text-pink-600'
                                }`} />
                        </div>
                        <div>
                                <h3 className="font-semibold">{hostel.hostelName}</h3>
                                <p className="text-sm text-gray-600">{hostel.hostelCode}</p>
                      </div>
                            </div>
                            <Badge variant={hostel.gender === 'Male' ? 'default' : 'secondary'}>
                              {hostel.gender}
                            </Badge>
                </div>
              </CardHeader>
              <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Capacity</span>
                              <span className="font-medium">{hostel.totalCapacity} beds</span>
                          </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Occupied</span>
                              <span className="font-medium">{hostel.currentOccupancy} beds</span>
                          </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Occupancy</span>
                                <span className={`font-medium ${
                                  hostelOccupancy >= 90 ? 'text-red-600' :
                                  hostelOccupancy >= 70 ? 'text-orange-600' :
                                  'text-green-600'
                                }`}>
                                  {hostelOccupancy}%
                                </span>
                        </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all ${
                                    hostelOccupancy >= 90 ? 'bg-red-600' :
                                    hostelOccupancy >= 70 ? 'bg-orange-600' :
                                    'bg-green-600'
                                  }`}
                                  style={{ width: `${hostelOccupancy}%` }}
                                />
                        </div>
                      </div>
                            {hostel.hostelType && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>{hostel.hostelType}</span>
                        </div>
                            )}
                            <Button variant="outline" className="w-full mt-4">
                              View Details
                            </Button>
                </div>
              </CardContent>
            </Card>
                    );
                  })}
                      </div>
              )}
                </CardContent>
          </Tabs>
              </Card>
      </div>
    </DashboardLayout>
  );
}
