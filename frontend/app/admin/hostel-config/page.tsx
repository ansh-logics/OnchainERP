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
import { Textarea } from "@/components/ui/textarea";
import { getCurrentUser } from "@/lib/auth";
import { 
  Building,
  BedDouble,
  Plus,
  Edit,
  Trash2,
  Users,
  MapPin,
  Wifi,
  Car,
  Utensils,
  Shield,
  Zap,
  Droplets,
  Wind,
  Save,
  Settings,
  Home,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

interface HostelBlock {
  id: string;
  name: string;
  type: 'boys' | 'girls' | 'mixed';
  floors: number;
  totalRooms: number;
  occupiedRooms: number;
  capacity: number;
  currentOccupancy: number;
  warden: string;
  wardenPhone: string;
  wardenEmail: string;
  facilities: string[];
  status: 'active' | 'maintenance' | 'closed';
  monthlyFee: number;
  securityDeposit: number;
}

interface Room {
  id: string;
  blockId: string;
  roomNumber: string;
  floor: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  currentOccupants: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  facilities: string[];
  monthlyRent: number;
}

export default function HostelConfigurationPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState("all");
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

  const hostelBlocks: HostelBlock[] = [
    {
      id: "1",
      name: "Block A - Rajiv Gandhi Hostel",
      type: "boys",
      floors: 4,
      totalRooms: 120,
      occupiedRooms: 115,
      capacity: 240,
      currentOccupancy: 220,
      warden: "Dr. Suresh Patel",
      wardenPhone: "+91 98765 43210",
      wardenEmail: "suresh.patel@yukti.edu.in",
      facilities: ["wifi", "mess", "laundry", "security", "parking", "gym"],
      status: "active",
      monthlyFee: 8000,
      securityDeposit: 15000
    },
    {
      id: "2", 
      name: "Block B - Kalam Girls Hostel",
      type: "girls",
      floors: 5,
      totalRooms: 150,
      occupiedRooms: 142,
      capacity: 300,
      currentOccupancy: 285,
      warden: "Dr. Priya Sharma",
      wardenPhone: "+91 98765 43211",
      wardenEmail: "priya.sharma@yukti.edu.in",
      facilities: ["wifi", "mess", "laundry", "security", "medical", "salon"],
      status: "active",
      monthlyFee: 8500,
      securityDeposit: 15000
    },
    {
      id: "3",
      name: "Block C - International Hostel",
      type: "mixed",
      floors: 3,
      totalRooms: 80,
      occupiedRooms: 76,
      capacity: 160,
      currentOccupancy: 152,
      warden: "Prof. Maria Rodriguez",
      wardenPhone: "+91 98765 43212",
      wardenEmail: "maria.rodriguez@yukti.edu.in",
      facilities: ["wifi", "mess", "laundry", "security", "ac", "kitchenette"],
      status: "active",
      monthlyFee: 12000,
      securityDeposit: 20000
    },
    {
      id: "4",
      name: "Block D - Research Scholars",
      type: "mixed",
      floors: 4,
      totalRooms: 100,
      occupiedRooms: 45,
      capacity: 150,
      currentOccupancy: 68,
      warden: "Dr. Rajesh Gupta",
      wardenPhone: "+91 98765 43213",
      wardenEmail: "rajesh.gupta@yukti.edu.in",
      facilities: ["wifi", "mess", "laundry", "security", "study_hall", "library"],
      status: "maintenance",
      monthlyFee: 10000,
      securityDeposit: 18000
    }
  ];

  const sampleRooms: Room[] = [
    {
      id: "1",
      blockId: "1",
      roomNumber: "A101",
      floor: 1,
      type: "double",
      capacity: 2,
      currentOccupants: 2,
      status: "occupied",
      facilities: ["attached_bathroom", "balcony", "study_table", "wardrobe"],
      monthlyRent: 8000
    },
    {
      id: "2",
      blockId: "1",
      roomNumber: "A102",
      floor: 1,
      type: "double",
      capacity: 2,
      currentOccupants: 1,
      status: "available",
      facilities: ["attached_bathroom", "balcony", "study_table", "wardrobe"],
      monthlyRent: 8000
    },
    {
      id: "3",
      blockId: "2",
      roomNumber: "B201",
      floor: 2,
      type: "single",
      capacity: 1,
      currentOccupants: 1,
      status: "occupied",
      facilities: ["attached_bathroom", "ac", "study_table", "wardrobe"],
      monthlyRent: 12000
    }
  ];

  const facilityIcons: { [key: string]: any } = {
    wifi: Wifi,
    mess: Utensils,
    laundry: Home,
    security: Shield,
    parking: Car,
    gym: Users,
    medical: Plus,
    salon: Users,
    ac: Wind,
    kitchenette: Utensils,
    study_hall: Users,
    library: Users,
    attached_bathroom: Droplets,
    balcony: Home,
    study_table: Users,
    wardrobe: Home
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'available': case 'occupied': return 'bg-green-100 text-green-800';
      case 'maintenance': case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'available': case 'occupied': return CheckCircle;
      case 'maintenance': case 'reserved': return AlertCircle;
      case 'closed': return XCircle;
      default: return AlertCircle;
    }
  };

  return (
    <DashboardLayout title="Hostel Configuration" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Hostel Configuration</h2>
            <p className="text-muted-foreground">Manage hostel blocks, rooms, and facilities</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Hostel Block
          </Button>
        </div>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Blocks</p>
                  <p className="text-2xl font-bold">{hostelBlocks.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold">{hostelBlocks.reduce((sum, block) => sum + block.capacity, 0)}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Current Occupancy</p>
                  <p className="text-2xl font-bold">{hostelBlocks.reduce((sum, block) => sum + block.currentOccupancy, 0)}</p>
                </div>
                <BedDouble className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-2xl font-bold">
                    {Math.round((hostelBlocks.reduce((sum, block) => sum + block.currentOccupancy, 0) / 
                    hostelBlocks.reduce((sum, block) => sum + block.capacity, 0)) * 100)}%
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="blocks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="blocks">Hostel Blocks</TabsTrigger>
            <TabsTrigger value="rooms">Room Management</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="blocks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hostelBlocks.map((block) => {
                const occupancyPercentage = Math.round((block.currentOccupancy / block.capacity) * 100);
                const StatusIcon = getStatusIcon(block.status);
                
                return (
                  <Card key={block.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{block.name}</CardTitle>
                          <CardDescription>{block.floors} floors • {block.totalRooms} rooms</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(block.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {block.status}
                          </Badge>
                          <Badge className={
                            block.type === 'boys' ? 'bg-blue-100 text-blue-800' :
                            block.type === 'girls' ? 'bg-pink-100 text-pink-800' :
                            'bg-purple-100 text-purple-800'
                          }>
                            {block.type}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Occupancy Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Occupancy</span>
                          <span>{block.currentOccupancy}/{block.capacity} ({occupancyPercentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              occupancyPercentage > 90 ? 'bg-red-500' :
                              occupancyPercentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${occupancyPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Warden Information */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Warden Information
                        </h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{block.warden}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{block.wardenPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{block.wardenEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* Facilities */}
                      <div>
                        <h4 className="font-semibold mb-3">Available Facilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {block.facilities.map((facility) => {
                            const FacilityIcon = facilityIcons[facility] || Settings;
                            return (
                              <Badge key={facility} variant="outline" className="flex items-center gap-1">
                                <FacilityIcon className="h-3 w-3" />
                                {facility.replace('_', ' ')}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>

                      {/* Fee Information */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <p className="text-sm text-gray-600">Monthly Fee</p>
                          <p className="text-lg font-bold text-green-600">₹{block.monthlyFee.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Security Deposit</p>
                          <p className="text-lg font-bold text-blue-600">₹{block.securityDeposit.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Block
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <BedDouble className="h-4 w-4 mr-2" />
                          Manage Rooms
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            {/* Room Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Hostel Block</Label>
                    <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select block" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Blocks</SelectItem>
                        {hostelBlocks.map((block) => (
                          <SelectItem key={block.id} value={block.id}>
                            {block.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Floors</SelectItem>
                        <SelectItem value="1">Floor 1</SelectItem>
                        <SelectItem value="2">Floor 2</SelectItem>
                        <SelectItem value="3">Floor 3</SelectItem>
                        <SelectItem value="4">Floor 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="double">Double</SelectItem>
                        <SelectItem value="triple">Triple</SelectItem>
                        <SelectItem value="quad">Quad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sampleRooms.map((room) => {
                const block = hostelBlocks.find(b => b.id === room.blockId);
                const StatusIcon = getStatusIcon(room.status);
                
                return (
                  <Card key={room.id} className={`border-2 ${
                    room.status === 'available' ? 'border-green-200' :
                    room.status === 'occupied' ? 'border-blue-200' :
                    room.status === 'maintenance' ? 'border-yellow-200' :
                    'border-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{room.roomNumber}</h3>
                        <Badge className={getStatusColor(room.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {room.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>Block:</span>
                          <span className="font-medium">{block?.name.split(' - ')[0]}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Floor:</span>
                          <span className="font-medium">{room.floor}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Type:</span>
                          <span className="font-medium capitalize">{room.type}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Occupancy:</span>
                          <span className="font-medium">{room.currentOccupants}/{room.capacity}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Rent:</span>
                          <span className="font-medium text-green-600">₹{room.monthlyRent.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">Facilities:</p>
                        <div className="flex flex-wrap gap-1">
                          {room.facilities.slice(0, 3).map((facility) => {
                            const FacilityIcon = facilityIcons[facility] || Settings;
                            return (
                              <Badge key={facility} variant="outline" className="text-xs">
                                <FacilityIcon className="h-2 w-2 mr-1" />
                                {facility.replace('_', ' ')}
                              </Badge>
                            );
                          })}
                          {room.facilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{room.facilities.length - 3}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Facility Management</CardTitle>
                <CardDescription>Configure available facilities for hostel blocks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(facilityIcons).map(([facility, Icon]) => (
                    <Card key={facility} className="border-dashed">
                      <CardContent className="p-6 text-center">
                        <Icon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="font-semibold mb-2 capitalize">{facility.replace('_', ' ')}</h3>
                        <p className="text-sm text-gray-600 mb-4">Available in {
                          hostelBlocks.filter(block => block.facilities.includes(facility)).length
                        } blocks</p>
                        <Button variant="outline" size="sm">Configure</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure hostel management settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default Check-in Time</Label>
                      <Input type="time" defaultValue="14:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Default Check-out Time</Label>
                      <Input type="time" defaultValue="11:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Visitor Hours (From)</Label>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Visitor Hours (To)</Label>
                      <Input type="time" defaultValue="21:00" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Late Fee Penalty (per day)</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Security Deposit Refund Period (days)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Advance Notice Period (days)</Label>
                      <Input type="number" defaultValue="30" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Occupancy Override</Label>
                      <Select defaultValue="no">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Allow</SelectItem>
                          <SelectItem value="no">Don't Allow</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Hostel Rules & Regulations</Label>
                  <Textarea 
                    rows={6}
                    defaultValue="1. Maintain cleanliness in rooms and common areas
2. No loud music or noise after 10 PM
3. Visitors must register at the reception
4. No alcohol or smoking inside premises
5. Respect fellow students and staff
6. Follow mess timings strictly
7. Report any maintenance issues immediately
8. No unauthorized guests overnight"
                  />
                </div>

                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure automated notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Fee Payment Reminders</p>
                      <p className="text-sm text-gray-600">Send reminders before due date</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Room Allocation Notifications</p>
                      <p className="text-sm text-gray-600">Notify students about room assignments</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Maintenance Alerts</p>
                      <p className="text-sm text-gray-600">Alert wardens about maintenance requests</p>
                    </div>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
