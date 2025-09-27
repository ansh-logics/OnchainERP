"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { mockHostelRooms } from "@/lib/mock-data";
import { 
  Search,
  Building, 
  Users, 
  Home, 
  UserPlus, 
  UserMinus,
  Eye,
  Filter,
  Download,
  Bed,
  Wifi,
  Car,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

export default function StaffHostelPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("rooms");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'staff') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Extended mock room data
  const rooms = [
    {
      id: '1',
      roomNumber: '101',
      building: 'Block A',
      floor: '1st Floor',
      capacity: 2,
      occupied: 2,
      type: 'double',
      status: 'occupied',
      amenities: ['WiFi', 'Study Table', 'Wardrobe', 'Fan', 'Attached Bathroom'],
      students: [
        { name: 'Priya Sharma', rollNumber: 'CS21B001', checkIn: '2023-08-01' },
        { name: 'Sneha Reddy', rollNumber: 'EC21B023', checkIn: '2023-08-01' }
      ],
      rent: 15000
    },
    {
      id: '2',
      roomNumber: '205',
      building: 'Block B',
      floor: '2nd Floor',
      capacity: 3,
      occupied: 2,
      type: 'triple',
      status: 'partial',
      amenities: ['WiFi', 'Study Table', 'Wardrobe', 'AC', 'Attached Bathroom'],
      students: [
        { name: 'Rahul Kumar', rollNumber: 'ME21B045', checkIn: '2023-08-15' },
        { name: 'Amit Patel', rollNumber: 'CV21B089', checkIn: '2023-09-01' }
      ],
      rent: 18000
    },
    {
      id: '3',
      roomNumber: '301',
      building: 'Block A',
      floor: '3rd Floor',
      capacity: 1,
      occupied: 0,
      type: 'single',
      status: 'available',
      amenities: ['WiFi', 'Study Table', 'Wardrobe', 'AC', 'Attached Bathroom', 'Balcony'],
      students: [],
      rent: 25000
    },
    {
      id: '4',
      roomNumber: '102',
      building: 'Block C',
      floor: '1st Floor',
      capacity: 2,
      occupied: 0,
      type: 'double',
      status: 'maintenance',
      amenities: ['WiFi', 'Study Table', 'Wardrobe', 'Fan'],
      students: [],
      rent: 15000
    }
  ];

  // Mock allocation requests
  const allocationRequests = [
    {
      id: '1',
      studentName: 'Arjun Malhotra',
      rollNumber: 'IT21B078',
      department: 'Information Technology',
      roomPreference: 'Single AC Room',
      requestDate: '2024-03-15',
      status: 'pending',
      priority: 'high',
      contact: '+91 9876543214'
    },
    {
      id: '2',
      studentName: 'Kavya Nair',
      rollNumber: 'ECE21B056',
      department: 'Electronics',
      roomPreference: 'Double Room',
      requestDate: '2024-03-14',
      status: 'approved',
      priority: 'medium',
      contact: '+91 9876543215'
    },
    {
      id: '3',
      studentName: 'Rohit Sharma',
      rollNumber: 'CS21B089',
      department: 'Computer Science',
      roomPreference: 'Triple Room',
      requestDate: '2024-03-13',
      status: 'rejected',
      priority: 'low',
      contact: '+91 9876543216'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'available': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <Users className="h-4 w-4" />;
      case 'partial': return <UserPlus className="h-4 w-4" />;
      case 'available': return <Home className="h-4 w-4" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />;
      case 'pending': return <Eye className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <UserMinus className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.students.some(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredRequests = allocationRequests.filter(request => 
    request.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roomStats = {
    total: rooms.length,
    occupied: rooms.filter(room => room.status === 'occupied').length,
    partial: rooms.filter(room => room.status === 'partial').length,
    available: rooms.filter(room => room.status === 'available').length,
    maintenance: rooms.filter(room => room.status === 'maintenance').length,
    occupancyRate: Math.round((rooms.reduce((sum, room) => sum + room.occupied, 0) / rooms.reduce((sum, room) => sum + room.capacity, 0)) * 100),
    totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
    totalOccupied: rooms.reduce((sum, room) => sum + room.occupied, 0)
  };

  const requestStats = {
    total: allocationRequests.length,
    pending: allocationRequests.filter(req => req.status === 'pending').length,
    approved: allocationRequests.filter(req => req.status === 'approved').length,
    rejected: allocationRequests.filter(req => req.status === 'rejected').length,
  };

  return (
    <DashboardLayout title="Hostel Management" userRole="staff">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Hostel Management</h2>
            <p className="text-gray-600">Manage room allocations and hostel operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Allocate Room
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{roomStats.total}</div>
                  <p className="text-sm text-gray-600">Total Rooms</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold text-green-600">{roomStats.occupancyRate}%</div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-600" />
                <div>
                  <div className="text-xl font-bold text-emerald-600">{roomStats.available}</div>
                  <p className="text-sm text-gray-600">Available Rooms</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-xl font-bold text-orange-600">{requestStats.pending}</div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search rooms, students, or requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="requests">Allocation Requests</TabsTrigger>
            <TabsTrigger value="occupancy">Occupancy Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rooms" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Room Status</CardTitle>
                <CardDescription>Current status of all hostel rooms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredRooms.map((room) => (
                    <div key={room.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getStatusIcon(room.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">Room {room.roomNumber}</h3>
                            <p className="text-sm text-gray-600">{room.building} • {room.floor}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(room.status)}>
                          {room.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium">Capacity:</span> {room.capacity} {room.type}
                        </div>
                        <div>
                          <span className="font-medium">Occupied:</span> {room.occupied}/{room.capacity}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {room.type.charAt(0).toUpperCase() + room.type.slice(1)}
                        </div>
                        <div>
                          <span className="font-medium">Rent:</span> ₹{room.rent.toLocaleString()}/sem
                        </div>
                      </div>
                      
                      {room.students.length > 0 && (
                        <div className="mb-4">
                          <p className="font-medium text-sm mb-2">Current Residents:</p>
                          {room.students.map((student, index) => (
                            <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded mb-1">
                              <span>{student.name}</span>
                              <span>{student.rollNumber}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <p className="font-medium text-sm mb-2">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {room.status === 'available' && (
                          <Button size="sm">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Allocate
                          </Button>
                        )}
                        {room.status === 'partial' && (
                          <Button size="sm" variant="outline">
                            <UserPlus className="h-4 w-4 mr-1" />
                            Add Student
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Allocation Requests</CardTitle>
                <CardDescription>Student requests for room allocation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            {getStatusIcon(request.status)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{request.studentName}</h3>
                            <p className="text-sm text-gray-600">{request.rollNumber} • {request.department}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(request.status)}>
                            {request.status.toUpperCase()}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">Priority: {request.priority}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium">Preference:</span> {request.roomPreference}
                        </div>
                        <div>
                          <span className="font-medium">Request Date:</span> {new Date(request.requestDate).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Contact:</span> {request.contact}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                              <UserMinus className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="occupancy" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Block-wise Occupancy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">Block A</span>
                      <div className="text-right">
                        <span className="font-bold">85%</span>
                        <p className="text-sm text-gray-600">17/20 rooms occupied</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">Block B</span>
                      <div className="text-right">
                        <span className="font-bold">72%</span>
                        <p className="text-sm text-gray-600">13/18 rooms occupied</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                      <span className="font-medium">Block C</span>
                      <div className="text-right">
                        <span className="font-bold">90%</span>
                        <p className="text-sm text-gray-600">18/20 rooms occupied</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Room Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                      <span className="font-medium">Single Rooms</span>
                      <div className="text-right">
                        <span className="font-bold">8 rooms</span>
                        <p className="text-sm text-gray-600">6 occupied</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="font-medium">Double Rooms</span>
                      <div className="text-right">
                        <span className="font-bold">35 rooms</span>
                        <p className="text-sm text-gray-600">28 occupied</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                      <span className="font-medium">Triple Rooms</span>
                      <div className="text-right">
                        <span className="font-bold">15 rooms</span>
                        <p className="text-sm text-gray-600">14 occupied</p>
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
