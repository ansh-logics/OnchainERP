"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { mockStudentHostel } from "@/lib/mock-data";
import { 
  Building, 
  MapPin, 
  Users, 
  Wifi, 
  Car, 
  Utensils,
  Shield,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Mail,
  User,
  Home,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

export default function StudentHostelPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [router]);

  if (loading || !user) {
    return (
      <DashboardLayout title="Hostel Management" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading hostel information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Hostel Management" userRole="student">
      <div className="space-y-6">
        {/* Hostel Status */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-green-600" />
                <CardTitle className="text-green-800">Hostel Allocation Status</CardTitle>
              </div>
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              You are successfully allocated to Room {mockStudentHostel.roomDetails.roomNumber} in {mockStudentHostel.roomDetails.building}.
            </p>
          </CardContent>
        </Card>

        {/* Room Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Room Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Room Number</p>
                  <p className="text-muted-foreground">{mockStudentHostel.roomDetails.roomNumber}</p>
                </div>
                <div>
                  <p className="font-medium">Building</p>
                  <p className="text-muted-foreground">{mockStudentHostel.roomDetails.building}</p>
                </div>
                <div>
                  <p className="font-medium">Floor</p>
                  <p className="text-muted-foreground">{mockStudentHostel.roomDetails.floor}</p>
                </div>
                <div>
                  <p className="font-medium">Room Type</p>
                  <p className="text-muted-foreground">{mockStudentHostel.roomDetails.type}</p>
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">Roommates</p>
                <div className="space-y-2">
                  {mockStudentHostel.roomDetails.roommates.map((roommate, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{roommate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Warden Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Name</p>
                  <p className="text-muted-foreground">{mockStudentHostel.warden.name}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{mockStudentHostel.warden.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{mockStudentHostel.warden.email}</p>
                </div>
              </div>

              <Button 
                size="sm" 
                variant="outline" 
                className="w-full"
                onClick={() => toast.success('Contacting warden (Demo)')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Warden
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Room Facilities</CardTitle>
            <CardDescription>Available amenities in your room</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mockStudentHostel.facilities.map((facility, index) => (
                <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{facility}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hostel Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-in Date</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Date(mockStudentHostel.checkInDate).toLocaleDateString()}
              </div>
              <p className="text-xs text-muted-foreground">Move-in date</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Fee</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{mockStudentHostel.monthlyFee.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Per month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {mockStudentHostel.status.charAt(0).toUpperCase() + mockStudentHostel.status.slice(1)}
              </div>
              <p className="text-xs text-muted-foreground">Current status</p>
            </CardContent>
          </Card>
        </div>

        {/* Hostel Rules & Regulations */}
        <Card>
          <CardHeader>
            <CardTitle>Hostel Rules & Regulations</CardTitle>
            <CardDescription>Important guidelines for hostel residents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Curfew Timings</p>
                  <p className="text-muted-foreground">Entry allowed until 10:00 PM on weekdays, 11:00 PM on weekends</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Users className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Visitors Policy</p>
                  <p className="text-muted-foreground">Visitors allowed in common areas only between 9:00 AM - 6:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Security</p>
                  <p className="text-muted-foreground">ID card must be shown at entry. Lost cards should be reported immediately</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Utensils className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Mess Timings</p>
                  <p className="text-muted-foreground">Breakfast: 7:30-9:30 AM, Lunch: 12:30-2:30 PM, Dinner: 7:30-9:30 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => toast.success('Maintenance request submitted (Demo)')}
              >
                <AlertCircle className="h-5 w-5" />
                Report Issue
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => toast.success('Room change request submitted (Demo)')}
              >
                <Building className="h-5 w-5" />
                Room Change
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => toast.success('Viewing mess menu (Demo)')}
              >
                <Utensils className="h-5 w-5" />
                Mess Menu
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => router.push('/student/fees')}
              >
                <DollarSign className="h-5 w-5" />
                Pay Fees
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
