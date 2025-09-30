"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { 
  BarChart3,
  Download,
  Calendar,
  Users,
  DollarSign,
  GraduationCap,
  FileText,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  Filter,
  Clock,
  Building
} from "lucide-react";

export default function AdminReportsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [exportFormat, setExportFormat] = useState("pdf");
  const router = useRouter();

  // Export handlers
  const handleExportAllData = () => {
    // Create comprehensive data export
    const exportData = {
      timestamp: new Date().toISOString(),
      academic: {
        totalStudents: 1250,
        activeStudents: 1180,
        graduates: 70,
        averageAttendance: 87.5
      },
      financial: {
        totalRevenue: 56250000,
        collectedFees: 52800000,
        pendingFees: 3450000,
        refunds: 125000
      },
      administrative: {
        totalUsers: 1356,
        activeUsers: 1298,
        departments: 8,
        hostelOccupancy: 92
      }
    };

    if (exportFormat === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system_report_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (exportFormat === 'csv') {
      const csvData = Object.entries(exportData).flatMap(([category, data]) =>
        Object.entries(data as Record<string, unknown>).map(([key, value]) => ({
          Category: category,
          Metric: key,
          Value: value
        }))
      );
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `system_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleDownloadReport = (reportName: string) => {
    // Simulate report generation and download
    console.log(`Generating ${reportName}...`);
    
    // Mock report data based on report type
    const reportData = {
      reportName,
      generatedAt: new Date().toISOString(),
      data: `Sample data for ${reportName}`,
      summary: {
        totalRecords: Math.floor(Math.random() * 1000) + 100,
        dateRange: `${new Date(Date.now() - 30*24*60*60*1000).toDateString()} - ${new Date().toDateString()}`,
        generatedBy: user?.name || 'Admin'
      }
    };

    if (exportFormat === 'pdf') {
      // Simulate PDF generation
      alert(`PDF report "${reportName}" would be generated and downloaded here`);
    } else if (exportFormat === 'excel') {
      // Simulate Excel generation
      alert(`Excel report "${reportName}" would be generated and downloaded here`);
    } else {
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportName.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

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

  // Mock report data
  const reportCategories = [
    {
      id: 'academic',
      title: 'Academic Reports',
      description: 'Student performance, attendance, and academic analytics',
      icon: GraduationCap,
      reports: [
        { name: 'Student Performance Report', description: 'Semester-wise academic performance analysis', lastGenerated: '2024-03-14', status: 'ready' },
        { name: 'Attendance Report', description: 'Class-wise and student-wise attendance summary', lastGenerated: '2024-03-15', status: 'ready' },
        { name: 'Course Completion Report', description: 'Progress tracking for all enrolled courses', lastGenerated: '2024-03-13', status: 'ready' },
        { name: 'Grade Distribution Analysis', description: 'Statistical analysis of grades across departments', lastGenerated: '2024-03-12', status: 'generating' }
      ]
    },
    {
      id: 'financial',
      title: 'Financial Reports',
      description: 'Fee collection, revenue analysis, and financial insights',
      icon: DollarSign,
      reports: [
        { name: 'Fee Collection Report', description: 'Complete fee collection status and analysis', lastGenerated: '2024-03-15', status: 'ready' },
        { name: 'Revenue Analysis', description: 'Monthly and yearly revenue breakdowns', lastGenerated: '2024-03-14', status: 'ready' },
        { name: 'Outstanding Dues Report', description: 'List of pending fee payments by students', lastGenerated: '2024-03-15', status: 'ready' },
        { name: 'Payment Method Analysis', description: 'Analysis of preferred payment methods', lastGenerated: '2024-03-10', status: 'ready' }
      ]
    },
    {
      id: 'administrative',
      title: 'Administrative Reports',
      description: 'User activity, system usage, and operational metrics',
      icon: Users,
      reports: [
        { name: 'User Activity Report', description: 'System usage patterns and user engagement', lastGenerated: '2024-03-15', status: 'ready' },
        { name: 'Department Statistics', description: 'Department-wise student and faculty distribution', lastGenerated: '2024-03-14', status: 'ready' },
        { name: 'Hostel Occupancy Report', description: 'Room allocation and occupancy statistics', lastGenerated: '2024-03-13', status: 'ready' },
        { name: 'Library Usage Report', description: 'Book issuance and library utilization metrics', lastGenerated: '2024-03-12', status: 'generating' }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance & Audit Reports',
      description: 'Regulatory compliance and audit trail reports',
      icon: FileText,
      reports: [
        { name: 'Audit Trail Report', description: 'Complete system audit logs and activities', lastGenerated: '2024-03-15', status: 'ready' },
        { name: 'Data Privacy Compliance', description: 'GDPR and data protection compliance report', lastGenerated: '2024-03-01', status: 'ready' },
        { name: 'Security Incident Report', description: 'System security events and incidents', lastGenerated: '2024-03-14', status: 'ready' },
        { name: 'Backup & Recovery Report', description: 'System backup status and recovery metrics', lastGenerated: '2024-03-15', status: 'ready' }
      ]
    }
  ];

  // Mock analytics data
  const analyticsData = {
    totalStudents: 1250,
    totalFaculty: 85,
    totalRevenue: 2850000,
    pendingFees: 340000,
    systemUptime: 99.8,
    activeUsers: 1180,
    monthlyGrowth: {
      students: 5.2,
      revenue: 12.8,
      users: 8.5
    }
  };

  // Recent report generation activity
  const recentActivity = [
    { id: 1, report: 'Fee Collection Report', user: 'Admin', time: '10 minutes ago', status: 'completed' },
    { id: 2, report: 'Attendance Report', user: 'Dr. Sharma', time: '1 hour ago', status: 'completed' },
    { id: 3, report: 'User Activity Report', user: 'Admin', time: '2 hours ago', status: 'completed' },
    { id: 4, report: 'Grade Distribution Analysis', user: 'Prof. Patel', time: '4 hours ago', status: 'in-progress' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <FileText className="h-4 w-4" />;
      case 'generating': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <TrendingDown className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout title="Reports & Analytics" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <p className="text-gray-600">Generate comprehensive reports and view system analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{analyticsData.totalStudents.toLocaleString()}</div>
                  <p className="text-sm text-gray-600">Total Students</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    +{analyticsData.monthlyGrowth.students}% this month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold">₹{(analyticsData.totalRevenue / 100000).toFixed(1)}L</div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    +{analyticsData.monthlyGrowth.revenue}% this month
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-xl font-bold">{analyticsData.totalFaculty}</div>
                  <p className="text-sm text-gray-600">Faculty Members</p>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Building className="h-3 w-3" />
                    12 departments
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-xl font-bold">{analyticsData.systemUptime}%</div>
                  <p className="text-sm text-gray-600">System Uptime</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    {analyticsData.activeUsers} active users
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="administrative">Administrative</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {/* Report Categories Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Report Categories</CardTitle>
                    <CardDescription>Quick access to all report types</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {reportCategories.map((category) => (
                        <div key={category.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedTab(category.id)}>
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <category.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{category.title}</h3>
                              <p className="text-sm text-gray-600">{category.reports.length} reports</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{category.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Sidebar */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-sm">{activity.report}</p>
                            <Badge className={getStatusColor(activity.status)}>
                              {activity.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">Generated by {activity.user}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex gap-2 mb-2">
                        <select 
                          value={exportFormat} 
                          onChange={(e) => setExportFormat(e.target.value)}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="pdf">PDF</option>
                          <option value="excel">Excel</option>
                          <option value="csv">CSV</option>
                          <option value="json">JSON</option>
                        </select>
                      </div>
                      <Button variant="outline" className="w-full justify-start" onClick={handleExportAllData}>
                        <Download className="h-4 w-4 mr-2" />
                        Export All Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Scheduled Reports
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Filter className="h-4 w-4 mr-2" />
                        Custom Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {reportCategories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.reports.map((report, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              {getStatusIcon(report.status)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{report.name}</h3>
                              <p className="text-sm text-gray-600">{report.description}</p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <div className="text-gray-600">
                            <span className="font-medium">Last Generated:</span> {new Date(report.lastGenerated).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => alert(`Viewing ${report.name}...`)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDownloadReport(report.name)}>
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            {report.status === 'ready' && (
                              <Button size="sm" onClick={() => alert(`Regenerating ${report.name}...`)}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Regenerate
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
