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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import { 
  Building2,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Bed,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  UserMinus,
  Home,
  Wifi,
  Car,
  Utensils,
  Zap,
  Droplets,
  Shield,
  Camera
} from "lucide-react";

interface HostelRoom {
  id: string;
  roomNumber: string;
  block: string;
  floor: number;
  capacity: number;
  occupied: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  gender: 'male' | 'female' | 'mixed';
  status: 'available' | 'full' | 'maintenance' | 'reserved';
  facilities: string[];
  rent: number;
}

interface StudentAllocation {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  year: string;
  phone: string;
  email: string;
  roomId: string;
  roomNumber: string;
  block: string;
  checkinDate: string;
  checkoutDate?: string;
  status: 'active' | 'checked_out' | 'pending' | 'cancelled';
  emergencyContact: string;
  parentPhone: string;
  feePaid: boolean;
  securityDeposit: number;
}

export default function HostelAllocationPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedGender, setSelectedGender] = useState("all");
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

  const rooms: HostelRoom[] = [
    {
      id: "1",
      roomNumber: "A-101",
      block: "A Block",
      floor: 1,
      capacity: 2,
      occupied: 2,
      type: "double",
      gender: "male",
      status: "full",
      facilities: ["WiFi", "AC", "Attached Bathroom", "Study Table"],
      rent: 8000
    },
    {
      id: "2", 
      roomNumber: "A-102",
      block: "A Block",
      floor: 1,
      capacity: 2,
      occupied: 1,
      type: "double",
      gender: "male", 
      status: "available",
      facilities: ["WiFi", "Fan", "Attached Bathroom", "Study Table"],
      rent: 6000
    },
    {
      id: "3",
      roomNumber: "B-201",
      block: "B Block",
      floor: 2,
      capacity: 1,
      occupied: 1,
      type: "single",
      gender: "female",
      status: "full",
      facilities: ["WiFi", "AC", "Attached Bathroom", "Study Table", "Balcony"],
      rent: 12000
    },
    {
      id: "4",
      roomNumber: "B-202",
      block: "B Block", 
      floor: 2,
      capacity: 3,
      occupied: 0,
      type: "triple",
      gender: "female",
      status: "available",
      facilities: ["WiFi", "Fan", "Common Bathroom", "Study Table"],
      rent: 5000
    },
    {
      id: "5",
      roomNumber: "C-301",
      block: "C Block",
      floor: 3,
      capacity: 2,
      occupied: 0,
      type: "double",
      gender: "male",
      status: "maintenance",
      facilities: ["WiFi", "AC", "Attached Bathroom", "Study Table"],
      rent: 8000
    }
  ];

  const allocations: StudentAllocation[] = [
    {
      id: "1",
      studentId: "YU2024001",
      studentName: "Arjun Sharma",
      rollNumber: "21CS001",
      course: "B.Tech CSE",
      year: "3rd Year",
      phone: "+91 98765 43210",
      email: "arjun.sharma@email.com",
      roomId: "1",
      roomNumber: "A-101",
      block: "A Block",
      checkinDate: "2024-06-15",
      status: "active",
      emergencyContact: "+91 98765 43200",
      parentPhone: "+91 98765 43201",
      feePaid: true,
      securityDeposit: 5000
    },
    {
      id: "2",
      studentId: "YU2024002",
      studentName: "Priya Patel", 
      rollNumber: "21EC002",
      course: "B.Tech ECE",
      year: "3rd Year",
      phone: "+91 98765 43211",
      email: "priya.patel@email.com",
      roomId: "3",
      roomNumber: "B-201",
      block: "B Block",
      checkinDate: "2024-06-16",
      status: "active",
      emergencyContact: "+91 98765 43202",
      parentPhone: "+91 98765 43203",
      feePaid: true,
      securityDeposit: 7000
    },
    {
      id: "3",
      studentId: "YU2024003",
      studentName: "Rahul Singh",
      rollNumber: "22MBA001", 
      course: "MBA",
      year: "1st Year",
      phone: "+91 98765 43212",
      email: "rahul.singh@email.com",
      roomId: "1",
      roomNumber: "A-101", 
      block: "A Block",
      checkinDate: "2024-06-17",
      status: "active",
      emergencyContact: "+91 98765 43204",
      parentPhone: "+91 98765 43205",
      feePaid: false,
      securityDeposit: 5000
    },
    {
      id: "4",
      studentId: "YU2024004",
      studentName: "Sneha Gupta",
      rollNumber: "21CS003",
      course: "B.Tech CSE", 
      year: "3rd Year",
      phone: "+91 98765 43213",
      email: "sneha.gupta@email.com",
      roomId: "2",
      roomNumber: "A-102",
      block: "A Block",
      checkinDate: "2024-06-18",
      status: "pending",
      emergencyContact: "+91 98765 43206", 
      parentPhone: "+91 98765 43207",
      feePaid: false,
      securityDeposit: 5000
    }
  ];

  const blocks = ["All Blocks", "A Block", "B Block", "C Block", "D Block"];
  
  const filteredRooms = rooms.filter(room =>
    (selectedBlock === "all" || selectedBlock === "All Blocks" || room.block === selectedBlock) &&
    (selectedStatus === "all" || room.status === selectedStatus) &&
    (selectedGender === "all" || room.gender === selectedGender) &&
    (room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     room.block.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredAllocations = allocations.filter(allocation =>
    (selectedBlock === "all" || selectedBlock === "All Blocks" || allocation.block === selectedBlock) &&
    (allocation.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     allocation.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     allocation.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'full': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'reserved': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'full': return XCircle;
      case 'maintenance': return AlertCircle;
      case 'reserved': return Clock;
      case 'active': return CheckCircle;
      case 'pending': return Clock;
      case 'checked_out': return XCircle;
      case 'cancelled': return XCircle;
      default: return AlertCircle;
    }
  };

  const getFacilityIcon = (facility: string) => {
    switch (facility.toLowerCase()) {
      case 'wifi': return Wifi;
      case 'ac': return Zap;
      case 'parking': return Car;
      case 'mess': return Utensils;
      case 'water': return Droplets;
      case 'security': return Shield;
      case 'cctv': return Camera;
      default: return Home;
    }
  };

  const hostelStats = {
    totalRooms: rooms.length,
    occupied: rooms.reduce((sum, r) => sum + r.occupied, 0),
    available: rooms.filter(r => r.status === 'available').length,
    maintenance: rooms.filter(r => r.status === 'maintenance').length,
    totalCapacity: rooms.reduce((sum, r) => sum + r.capacity, 0),
    occupancyRate: Math.round((rooms.reduce((sum, r) => sum + r.occupied, 0) / rooms.reduce((sum, r) => sum + r.capacity, 0)) * 100),
    revenue: allocations.filter(a => a.feePaid).reduce((sum, a) => {
      const room = rooms.find(r => r.id === a.roomId);
      return sum + (room?.rent || 0);
    }, 0)
  };

  return (
    <DashboardLayout title="Hostel Allocation" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hostel Allocation Management</h2>
            <p className="text-muted-foreground">Manage room allocations and hostel facilities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Import
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              New Allocation
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{hostelStats.totalRooms}</p>
                <p className="text-sm text-gray-600">Total Rooms</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{hostelStats.available}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{hostelStats.occupied}</p>
                <p className="text-sm text-gray-600">Occupied</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{hostelStats.maintenance}</p>
                <p className="text-sm text-gray-600">Maintenance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{hostelStats.totalCapacity}</p>
                <p className="text-sm text-gray-600">Total Capacity</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{hostelStats.occupancyRate}%</p>
                <p className="text-sm text-gray-600">Occupancy</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">₹{(hostelStats.revenue / 1000).toFixed(0)}K</p>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rooms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="allocations">Allocations</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="rooms" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search rooms..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by block" />
                    </SelectTrigger>
                    <SelectContent>
                      {blocks.map((block) => (
                        <SelectItem key={block} value={block === "All Blocks" ? "all" : block}>
                          {block}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedGender} onValueChange={setSelectedGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Gender</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => {
                const StatusIcon = getStatusIcon(room.status);
                
                return (
                  <Card key={room.id} className={`hover:shadow-lg transition-shadow border-l-4 ${
                    room.status === 'available' ? 'border-l-green-500' :
                    room.status === 'full' ? 'border-l-red-500' :
                    room.status === 'maintenance' ? 'border-l-yellow-500' :
                    'border-l-blue-500'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{room.roomNumber}</h3>
                            <p className="text-sm text-gray-600">{room.block} • Floor {room.floor}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(room.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {room.status}
                        </Badge>
                      </div>

                      {/* Room Details */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Bed className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Capacity</span>
                          </div>
                          <p className="text-lg font-bold">{room.capacity}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium">Occupied</span>
                          </div>
                          <p className="text-lg font-bold">{room.occupied}</p>
                        </div>
                      </div>

                      {/* Room Type and Gender */}
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline" className="capitalize">{room.type} Room</Badge>
                        <Badge variant="outline" className="capitalize">{room.gender}</Badge>
                      </div>

                      {/* Monthly Rent */}
                      <div className="text-center p-3 bg-blue-50 rounded-lg mb-4">
                        <p className="text-sm text-gray-600">Monthly Rent</p>
                        <p className="text-xl font-bold text-blue-600">₹{room.rent.toLocaleString()}</p>
                      </div>

                      {/* Facilities */}
                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Facilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.map((facility, index) => {
                            const FacilityIcon = getFacilityIcon(facility);
                            return (
                              <div key={index} className="flex items-center gap-1 bg-gray-100 text-xs px-2 py-1 rounded">
                                <FacilityIcon className="h-3 w-3" />
                                {facility}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {room.status === 'available' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Allocate
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="allocations" className="space-y-6">
            {/* Search */}
            <Card>
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search allocations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Allocations List */}
            <div className="space-y-4">
              {filteredAllocations.map((allocation) => {
                const StatusIcon = getStatusIcon(allocation.status);
                
                return (
                  <Card key={allocation.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{allocation.studentName}</h3>
                            <p className="text-sm text-gray-600">Roll: {allocation.rollNumber} | ID: {allocation.studentId}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{allocation.course}</Badge>
                              <Badge variant="outline">{allocation.year}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(allocation.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {allocation.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">Check-in: {allocation.checkinDate}</p>
                        </div>
                      </div>

                      {/* Room Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Room: {allocation.roomNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Block: {allocation.block}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{allocation.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{allocation.email}</span>
                        </div>
                      </div>

                      {/* Emergency Contacts & Payment Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Emergency Contact</p>
                          <p className="text-sm text-gray-600">{allocation.emergencyContact}</p>
                          <p className="text-sm font-medium mt-2">Parent Contact</p>
                          <p className="text-sm text-gray-600">{allocation.parentPhone}</p>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Fee Payment:</span>
                            <Badge className={allocation.feePaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {allocation.feePaid ? 'Paid' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Security Deposit:</span>
                            <span className="text-sm font-medium">₹{allocation.securityDeposit.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {allocation.status === 'active' && (
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            <UserMinus className="h-4 w-4 mr-2" />
                            Check Out
                          </Button>
                        )}
                        {allocation.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hostel Applications</CardTitle>
                <CardDescription>Manage new hostel accommodation requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">12</p>
                        <p className="text-sm text-gray-600">New Applications</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">8</p>
                        <p className="text-sm text-gray-600">Under Review</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">25</p>
                        <p className="text-sm text-gray-600">Approved</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Amit Verma", rollNumber: "21ME005", course: "B.Tech ME", status: "pending", priority: "high" },
                    { name: "Riya Gupta", rollNumber: "21CSE006", course: "B.Tech CSE", status: "review", priority: "medium" },
                    { name: "Karan Shah", rollNumber: "22MBA003", course: "MBA", status: "approved", priority: "low" }
                  ].map((app, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{app.name}</h4>
                              <p className="text-sm text-gray-600">{app.rollNumber} • {app.course}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              app.priority === 'high' ? 'border-red-300 text-red-700' :
                              app.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }>
                              {app.priority} priority
                            </Badge>
                            <Badge className={getStatusColor(app.status)}>
                              {app.status}
                            </Badge>
                            <Button size="sm" variant="outline">Review</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
                <CardDescription>Track and manage hostel maintenance issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { title: "Open Requests", count: 8, color: "red" },
                    { title: "In Progress", count: 3, color: "yellow" },
                    { title: "Completed", count: 15, color: "green" },
                    { title: "Pending Parts", count: 2, color: "blue" }
                  ].map((stat, index) => (
                    <Card key={index} className={`border-l-4 border-l-${stat.color}-500`}>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className={`text-2xl font-bold text-${stat.color}-600`}>{stat.count}</p>
                          <p className="text-sm text-gray-600">{stat.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  {[
                    { room: "A-101", issue: "AC not working", priority: "high", status: "open", date: "2024-07-20" },
                    { room: "B-205", issue: "Water leakage", priority: "high", status: "progress", date: "2024-07-19" },
                    { room: "C-301", issue: "WiFi connectivity", priority: "medium", status: "open", date: "2024-07-18" }
                  ].map((request, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <AlertCircle className={`h-5 w-5 ${
                              request.priority === 'high' ? 'text-red-500' :
                              request.priority === 'medium' ? 'text-yellow-500' :
                              'text-green-500'
                            }`} />
                            <div>
                              <h4 className="font-semibold">Room {request.room}</h4>
                              <p className="text-sm text-gray-600">{request.issue}</p>
                              <p className="text-xs text-gray-500">Reported: {request.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={
                              request.priority === 'high' ? 'border-red-300 text-red-700' :
                              request.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                              'border-green-300 text-green-700'
                            }>
                              {request.priority}
                            </Badge>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                            <Button size="sm" variant="outline">Assign</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Occupancy Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {blocks.slice(1).map((block) => {
                      const blockRooms = rooms.filter(r => r.block === block);
                      const occupancy = blockRooms.length > 0 ? 
                        Math.round((blockRooms.reduce((sum, r) => sum + r.occupied, 0) / blockRooms.reduce((sum, r) => sum + r.capacity, 0)) * 100) : 0;
                      
                      return (
                        <div key={block}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{block}</span>
                            <span>{occupancy}% occupied</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${occupancy}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">₹{(hostelStats.revenue / 1000).toFixed(0)}K</p>
                      <p className="text-sm text-green-700">Monthly Revenue</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">₹2.8L</p>
                        <p className="text-xs text-blue-700">Security Deposits</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-lg font-bold text-purple-600">₹45K</p>
                        <p className="text-xs text-purple-700">Pending Payments</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
