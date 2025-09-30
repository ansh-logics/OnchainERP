"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
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
  Clock
} from "lucide-react";

export default function StudentHostelPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock hostel data
  const hostelInfo = {
    allocated: true,
    block: "Block A",
    roomNumber: "A-205",
    floor: "2nd Floor",
    roomType: "Double Sharing",
    rent: 15000,
    securityDeposit: 5000,
    checkInDate: "2024-07-15",
    roommate: "Amit Sharma",
    warden: {
      name: "Dr. Sunita Verma",
      phone: "+91-98765-43210",
      email: "warden.blocka@yukti.edu"
    }
  };

  const facilities = [
    { icon: Wifi, name: "Free WiFi", available: true },
    { icon: Utensils, name: "Mess Facility", available: true },
    { icon: Car, name: "Parking", available: true },
    { icon: Shield, name: "24/7 Security", available: true },
    { icon: Users, name: "Common Room", available: true },
  ];

  const recentNotices = [
    { id: 1, title: "Hostel Fee Due Date Extended", date: "2024-09-20", type: "info" },
    { id: 2, title: "Room Cleaning Schedule", date: "2024-09-18", type: "notice" },
    { id: 3, title: "Maintenance Work - Block A", date: "2024-09-15", type: "alert" },
  ];

  return (
    <DashboardLayout title="Hostel Information" userRole="student">
      <div className="space-y-6">
        {/* Current Allocation Status */}
        <Card className={hostelInfo.allocated ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-green-600" />
                <div>
                  <CardTitle>Room Allocation Status</CardTitle>
                  <CardDescription>Your current hostel accommodation</CardDescription>
                </div>
              </div>
              <Badge className={hostelInfo.allocated ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                {hostelInfo.allocated ? "Allocated" : "Pending"}
              </Badge>
            </div>
          </CardHeader>
          {hostelInfo.allocated && (
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{hostelInfo.block}</p>
                    <p className="text-xs text-gray-600">Block</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{hostelInfo.roomNumber}</p>
                    <p className="text-xs text-gray-600">Room Number</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{hostelInfo.roomType}</p>
                    <p className="text-xs text-gray-600">Room Type</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium">{new Date(hostelInfo.checkInDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-600">Check-in Date</p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Monthly Rent</p>
                  <p className="text-lg font-bold text-green-600">₹{hostelInfo.rent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Security Deposit</p>
                  <p className="text-lg font-bold">₹{hostelInfo.securityDeposit.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Roommate</p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{hostelInfo.roommate}</p>
                    <p className="text-sm text-gray-600">Room Partner</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warden Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Warden Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{hostelInfo.warden.name}</p>
                    <p className="text-sm text-gray-600">Block A Warden</p>
                    <p className="text-sm text-blue-600">{hostelInfo.warden.phone}</p>
                    <p className="text-sm text-gray-600">{hostelInfo.warden.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Phone className="h-4 w-4 mr-2" />
                  Contact Warden
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Facilities */}
        <Card>
          <CardHeader>
            <CardTitle>Hostel Facilities</CardTitle>
            <CardDescription>Available amenities and services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {facilities.map((facility) => (
                <div
                  key={facility.name}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-center"
                >
                  <div className={`p-3 rounded-full mb-2 ${facility.available ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <facility.icon className={`h-6 w-6 ${facility.available ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <p className="text-sm font-medium">{facility.name}</p>
                  <Badge variant={facility.available ? "default" : "secondary"} className="mt-1 text-xs">
                    {facility.available ? "Available" : "Not Available"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Notices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Hostel Notices
            </CardTitle>
            <CardDescription>Important announcements and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNotices.map((notice) => (
                <div key={notice.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-1 rounded-full ${
                      notice.type === 'alert' ? 'bg-red-100' : 
                      notice.type === 'info' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {notice.type === 'alert' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : notice.type === 'info' ? (
                        <CheckCircle className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{notice.title}</p>
                      <p className="text-xs text-gray-600">{new Date(notice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {notice.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
