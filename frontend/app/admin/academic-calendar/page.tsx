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
import { getCurrentUser } from "@/lib/auth";
import { 
  Calendar,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  GraduationCap,
  Clock,
  Users,
  FileText,
  Download,
  Upload,
  Save
} from "lucide-react";

interface AcademicEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'semester' | 'exam' | 'holiday' | 'event' | 'registration';
  department?: string;
  status: 'upcoming' | 'ongoing' | 'completed';
}

export default function AcademicCalendarPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("2024-25");
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

  const academicEvents: AcademicEvent[] = [
    {
      id: "1",
      title: "Odd Semester Begins",
      description: "Classes commence for odd semester 2024-25",
      startDate: "2024-07-15",
      endDate: "2024-07-15",
      type: "semester",
      status: "completed"
    },
    {
      id: "2", 
      title: "Mid-Term Examinations",
      description: "Mid-term exams for all departments",
      startDate: "2024-09-15",
      endDate: "2024-09-25",
      type: "exam",
      status: "completed"
    },
    {
      id: "3",
      title: "Diwali Break",
      description: "Festival holidays",
      startDate: "2024-11-01",
      endDate: "2024-11-05",
      type: "holiday",
      status: "completed"
    },
    {
      id: "4",
      title: "End Semester Exams",
      description: "Final examinations for odd semester",
      startDate: "2024-12-15",
      endDate: "2024-12-30",
      type: "exam",
      status: "upcoming"
    },
    {
      id: "5",
      title: "Winter Break",
      description: "Semester break",
      startDate: "2025-01-01",
      endDate: "2025-01-15",
      type: "holiday",
      status: "upcoming"
    },
    {
      id: "6",
      title: "Even Semester Registration",
      description: "Course registration for even semester",
      startDate: "2025-01-10",
      endDate: "2025-01-20",
      type: "registration",
      status: "upcoming"
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'semester': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'holiday': return 'bg-green-100 text-green-800';
      case 'event': return 'bg-purple-100 text-purple-800';
      case 'registration': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'ongoing': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout title="Academic Calendar" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Academic Calendar</h2>
            <p className="text-muted-foreground">Manage academic year events and schedules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Calendar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </div>

        {/* Academic Year Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Academic Year: {selectedYear}
            </CardTitle>
            <CardDescription>Select academic year to view and manage events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {["2023-24", "2024-25", "2025-26"].map((year) => (
                <Button
                  key={year}
                  variant={selectedYear === year ? "default" : "outline"}
                  onClick={() => setSelectedYear(year)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="events">Events List</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Semester Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Odd Semester 2024</CardTitle>
                  <CardDescription>July - December 2024</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Start Date</span>
                      <Badge variant="outline">15 Jul 2024</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">End Date</span>
                      <Badge variant="outline">30 Dec 2024</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-green-100 text-green-800">Ongoing</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Even Semester 2025</CardTitle>
                  <CardDescription>January - June 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Start Date</span>
                      <Badge variant="outline">16 Jan 2025</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">End Date</span>
                      <Badge variant="outline">30 Jun 2025</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Upcoming</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Summer Term</CardTitle>
                  <CardDescription>May - July 2025</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Duration</span>
                      <Badge variant="outline">8 Weeks</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Type</span>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Status</span>
                      <Badge className="bg-gray-100 text-gray-800">Planning</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly View */}
            <Card>
              <CardHeader>
                <CardTitle>December 2024 Events</CardTitle>
                <CardDescription>Upcoming events this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicEvents.filter(event => 
                    new Date(event.startDate).getMonth() === 11 && 
                    new Date(event.startDate).getFullYear() === 2024
                  ).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {new Date(event.startDate).getDate()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getEventTypeColor(event.type)}>
                          {event.type}
                        </Badge>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Academic Events</CardTitle>
                <CardDescription>Complete list of events for academic year {selectedYear}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {academicEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-bold text-primary">
                            {new Date(event.startDate).getDate()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={getEventTypeColor(event.type)}>
                              {event.type}
                            </Badge>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status}
                            </Badge>
                            {event.startDate !== event.endDate && (
                              <span className="text-xs text-gray-500">
                                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar Templates</CardTitle>
                <CardDescription>Pre-configured academic calendar templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold mb-2">Semester System</h3>
                      <p className="text-sm text-gray-600 mb-4">Standard two-semester academic year</p>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold mb-2">Trimester System</h3>
                      <p className="text-sm text-gray-600 mb-4">Three-term academic year system</p>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold mb-2">Quarter System</h3>
                      <p className="text-sm text-gray-600 mb-4">Four-quarter academic calendar</p>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import/Export Options</CardTitle>
                <CardDescription>Manage calendar data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Import Calendar</h3>
                    <p className="text-sm text-gray-600">Import events from CSV or ICS files</p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import from File
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Export Calendar</h3>
                    <p className="text-sm text-gray-600">Export current calendar to various formats</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">PDF</Button>
                      <Button variant="outline" size="sm">CSV</Button>
                      <Button variant="outline" size="sm">ICS</Button>
                    </div>
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
