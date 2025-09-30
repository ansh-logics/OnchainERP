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
import { 
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Archive,
  RefreshCw,
  Bell,
  Settings,
  Eye,
  Server,
  Shield,
  Users,
  DollarSign,
  BookOpen
} from "lucide-react";

export default function AdminAlertsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedSeverity, setSelectedSeverity] = useState("all");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock alerts data
  const alerts = [
    {
      id: '1',
      title: 'Server maintenance scheduled',
      description: 'Routine server maintenance is scheduled for tomorrow at 2:00 AM. Expected downtime: 2 hours.',
      severity: 'info',
      category: 'system',
      timestamp: '2024-03-15 14:30:00',
      status: 'active',
      source: 'System Monitor',
      resolved: false,
      assignedTo: 'IT Team',
      details: {
        affectedServices: ['Web Portal', 'Student Login', 'Faculty Dashboard'],
        maintenanceWindow: '2:00 AM - 4:00 AM',
        backupStatus: 'Completed'
      }
    },
    {
      id: '2',
      title: 'Fee payment deadline approaching',
      description: 'Final fee payment deadline for spring semester is in 3 days. 156 students have pending payments.',
      severity: 'warning',
      category: 'financial',
      timestamp: '2024-03-15 12:15:00',
      status: 'active',
      source: 'Fee Management System',
      resolved: false,
      assignedTo: 'Accounts Department',
      details: {
        pendingStudents: 156,
        totalAmount: '₹7,800,000',
        departments: ['Computer Science: 45', 'Electronics: 38', 'Mechanical: 42', 'Civil: 31']
      }
    },
    {
      id: '3',
      title: 'Low hostel capacity in Block C',
      description: 'Hostel Block C has reached 95% capacity. Only 12 rooms available for new allocations.',
      severity: 'warning',
      category: 'accommodation',
      timestamp: '2024-03-15 10:45:00',
      status: 'active',
      source: 'Hostel Management',
      resolved: false,
      assignedTo: 'Hostel Warden',
      details: {
        currentOccupancy: '95%',
        availableRooms: 12,
        totalRooms: 240,
        waitingList: 28
      }
    },
    {
      id: '4',
      title: 'Database backup failed',
      description: 'Automated database backup failed at 3:00 AM due to insufficient storage space.',
      severity: 'critical',
      category: 'system',
      timestamp: '2024-03-15 03:15:00',
      status: 'active',
      source: 'Backup Service',
      resolved: false,
      assignedTo: 'System Administrator',
      details: {
        errorCode: 'DISK_FULL',
        availableSpace: '2.1 GB',
        requiredSpace: '8.5 GB',
        lastSuccessfulBackup: '2024-03-14 03:00:00'
      }
    },
    {
      id: '5',
      title: 'Multiple failed login attempts detected',
      description: 'Suspicious login activity detected from IP 203.192.1.50. Account has been temporarily locked.',
      severity: 'critical',
      category: 'security',
      timestamp: '2024-03-15 09:20:00',
      status: 'resolved',
      source: 'Security Monitor',
      resolved: true,
      assignedTo: 'Security Team',
      details: {
        sourceIP: '203.192.1.50',
        failedAttempts: 15,
        targetAccounts: ['student123@college.edu', 'faculty@college.edu'],
        actionTaken: 'IP Blocked, Account Locked'
      }
    },
    {
      id: '6',
      title: 'Exam schedule conflict detected',
      description: 'Scheduling conflict found for Computer Science final exams. Two exams scheduled in same hall.',
      severity: 'warning',
      category: 'academic',
      timestamp: '2024-03-14 16:30:00',
      status: 'resolved',
      source: 'Exam Management',
      resolved: true,
      assignedTo: 'Academic Office',
      details: {
        conflictDate: '2024-03-20',
        hallNumber: 'Hall A-101',
        courses: ['CS301 - Data Structures', 'CS302 - Algorithms'],
        resolution: 'CS302 moved to Hall B-205'
      }
    },
    {
      id: '7',
      title: 'Network performance degradation',
      description: 'Campus network experiencing slower response times. Average latency increased by 40%.',
      severity: 'warning',
      category: 'system',
      timestamp: '2024-03-14 11:20:00',
      status: 'active',
      source: 'Network Monitor',
      resolved: false,
      assignedTo: 'Network Team',
      details: {
        averageLatency: '140ms',
        normalLatency: '100ms',
        affectedAreas: ['Library', 'Computer Labs', 'Hostels'],
        possibleCause: 'High bandwidth usage'
      }
    }
  ];

  // Alert metrics
  const alertMetrics = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter(alert => !alert.resolved).length,
    criticalAlerts: alerts.filter(alert => alert.severity === 'critical' && !alert.resolved).length,
    warningAlerts: alerts.filter(alert => alert.severity === 'warning' && !alert.resolved).length,
    resolvedToday: alerts.filter(alert => alert.resolved && alert.timestamp.startsWith('2024-03-15')).length,
    avgResolutionTime: '4.2 hours'
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return <Server className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'financial': return <DollarSign className="h-4 w-4" />;
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'accommodation': return <Users className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (selectedTab !== 'all' && (selectedTab === 'active' ? alert.resolved : !alert.resolved)) return false;
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (searchTerm && !alert.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !alert.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const alertCategories = [
    { id: 'all', name: 'All Alerts', count: alerts.length },
    { id: 'active', name: 'Active', count: alerts.filter(alert => !alert.resolved).length },
    { id: 'resolved', name: 'Resolved', count: alerts.filter(alert => alert.resolved).length }
  ];

  return (
    <DashboardLayout title="System Alerts" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">System Alerts & Notifications</h2>
            <p className="text-gray-600">Monitor and manage system-wide alerts and notifications</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Alert Settings
            </Button>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Bell className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{alertMetrics.activeAlerts}</div>
                  <p className="text-sm text-gray-600">Active Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-xl font-bold text-red-600">{alertMetrics.criticalAlerts}</div>
                  <p className="text-sm text-gray-600">Critical Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="text-xl font-bold text-yellow-600">{alertMetrics.warningAlerts}</div>
                  <p className="text-sm text-gray-600">Warning Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{alertMetrics.resolvedToday}</div>
                  <p className="text-sm text-gray-600">Resolved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search alerts by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Management</CardTitle>
            <CardDescription>View, manage, and resolve system alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                {alertCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className={`border rounded-lg p-4 ${alert.resolved ? 'bg-gray-50' : 'bg-white'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mt-1 ${getSeverityColor(alert.severity)}`}>
                            {getSeverityIcon(alert.severity)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-semibold ${alert.resolved ? 'text-gray-600' : 'text-gray-900'}`}>
                                {alert.title}
                              </h3>
                              <Badge className={getSeverityColor(alert.severity)}>
                                {alert.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getCategoryIcon(alert.category)}
                                {alert.category}
                              </Badge>
                              {alert.resolved && (
                                <Badge className="bg-green-100 text-green-800">
                                  RESOLVED
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm mb-2 ${alert.resolved ? 'text-gray-500' : 'text-gray-700'}`}>
                              {alert.description}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mt-2">
                              <div>
                                <span className="font-medium">Source:</span> {alert.source}
                              </div>
                              <div>
                                <span className="font-medium">Assigned:</span> {alert.assignedTo}
                              </div>
                              <div>
                                <span className="font-medium">Created:</span> {new Date(alert.timestamp).toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> {alert.status}
                              </div>
                            </div>
                            {alert.details && (
                              <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                                <div className="font-medium mb-2">Details:</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(alert.details).map(([key, value]) => (
                                    <div key={key}>
                                      <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {value}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {!alert.resolved && (
                            <Button size="sm">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredAlerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No alerts found matching your criteria.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
