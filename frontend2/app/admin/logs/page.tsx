"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RealTimeMonitor } from "@/components/admin/real-time-monitor";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { 
  Search,
  Shield,
  User,
  Database,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Clock,
  Activity,
  Settings,
  FileText,
  LogIn,
  LogOut,
  UserPlus,
  Edit,
  Trash2
} from "lucide-react";

export default function AdminLogsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [realTimeModalOpen, setRealTimeModalOpen] = useState(false);
  const router = useRouter();

  // Export handlers
  const handleExportLogs = () => {
    const csvData = filteredLogs.map(log => ({
      Timestamp: log.timestamp,
      User: log.user,
      Action: log.action,
      Category: log.category,
      Severity: log.severity,
      Description: log.description,
      'IP Address': log.ipAddress,
      'User Agent': log.userAgent
    }));
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(csvData[0]).join(",") + "\n"
      + csvData.map(row => Object.values(row).map(value => `"${value}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${selectedTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewDetails = (log: any) => {
    const detailsWindow = window.open('', '_blank', 'width=800,height=600');
    if (!detailsWindow) return;

    const detailsHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Log Details - ${log.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
          .header { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .section { margin-bottom: 15px; }
          .label { font-weight: bold; color: #333; }
          .value { margin-left: 10px; }
          .details-grid { display: grid; grid-template-columns: 200px 1fr; gap: 10px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
          .severity-critical { background: #fee; color: #c53030; }
          .severity-warning { background: #fffbf0; color: #d69e2e; }
          .severity-info { background: #e6fffa; color: #319795; }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>Audit Log Details</h2>
          <p>Log ID: ${log.id} | Timestamp: ${log.timestamp}</p>
        </div>
        
        <div class="details-grid">
          <div class="label">Description:</div>
          <div class="value">${log.description}</div>
          
          <div class="label">User:</div>
          <div class="value">${log.user} (${log.userRole})</div>
          
          <div class="label">Action:</div>
          <div class="value">${log.action}</div>
          
          <div class="label">Category:</div>
          <div class="value">${log.category}</div>
          
          <div class="label">Severity:</div>
          <div class="value">
            <span class="badge severity-${log.severity}">${log.severity.toUpperCase()}</span>
          </div>
          
          <div class="label">IP Address:</div>
          <div class="value">${log.ipAddress}</div>
          
          <div class="label">Status:</div>
          <div class="value">${log.resolved ? 'RESOLVED' : 'ACTIVE'}</div>
          
          <div class="label">Assigned To:</div>
          <div class="value">${log.assignedTo}</div>
        </div>
        
        ${log.details ? `
          <div class="section">
            <h3>Additional Details</h3>
            <div class="details-grid">
              ${Object.entries(log.details).map(([key, value]) => `
                <div class="label">${key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</div>
                <div class="value">${value}</div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="section">
          <h3>User Agent</h3>
          <p style="word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 4px;">
            ${log.userAgent}
          </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Details
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">
            Close
          </button>
        </div>
      </body>
      </html>
    `;

    detailsWindow.document.write(detailsHtml);
    detailsWindow.document.close();
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

  // Mock audit logs data
  const auditLogs = [
    {
      id: '1',
      timestamp: '2024-03-15 10:30:25',
      user: 'admin@college.edu',
      userRole: 'admin',
      action: 'user_created',
      description: 'Created new faculty account for Dr. Sarah Johnson',
      category: 'user_management',
      severity: 'info',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: { targetUser: 'sarah.johnson@college.edu', department: 'Computer Science' }
    },
    {
      id: '2',
      timestamp: '2024-03-15 10:15:42',
      user: 'priya.sharma@college.edu',
      userRole: 'staff',
      action: 'fee_payment_processed',
      description: 'Processed fee payment for student John Doe',
      category: 'financial',
      severity: 'info',
      ipAddress: '192.168.1.105',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      details: { studentId: 'CS21B001', amount: '₹45,000', paymentMethod: 'UPI' }
    },
    {
      id: '3',
      timestamp: '2024-03-15 09:45:18',
      user: 'system',
      userRole: 'system',
      action: 'security_alert',
      description: 'Multiple failed login attempts detected',
      category: 'security',
      severity: 'warning',
      ipAddress: '203.192.1.50',
      userAgent: 'Unknown',
      details: { attempts: 5, targetAccount: 'student@college.edu', blocked: true }
    },
    {
      id: '4',
      timestamp: '2024-03-15 09:30:12',
      user: 'rajesh.kumar@college.edu',
      userRole: 'faculty',
      action: 'grade_updated',
      description: 'Updated grades for Data Structures course',
      category: 'academic',
      severity: 'info',
      ipAddress: '192.168.1.110',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: { course: 'CS301', studentsAffected: 42, semester: 'Spring 2024' }
    },
    {
      id: '5',
      timestamp: '2024-03-15 08:20:35',
      user: 'backup_service',
      userRole: 'system',
      action: 'backup_completed',
      description: 'Daily database backup completed successfully',
      category: 'system',
      severity: 'info',
      ipAddress: '127.0.0.1',
      userAgent: 'BackupService/1.0',
      details: { backupSize: '2.3 GB', duration: '45 minutes', status: 'success' }
    },
    {
      id: '6',
      timestamp: '2024-03-15 07:15:22',
      user: 'admin@college.edu',
      userRole: 'admin',
      action: 'system_configuration_changed',
      description: 'Modified system security settings',
      category: 'system',
      severity: 'critical',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      details: { setting: 'password_policy', oldValue: 'medium', newValue: 'strong' }
    },
    {
      id: '7',
      timestamp: '2024-03-14 18:45:10',
      user: 'maintenance_service',
      userRole: 'system',
      action: 'database_maintenance',
      description: 'Performed scheduled database optimization',
      category: 'system',
      severity: 'info',
      ipAddress: '127.0.0.1',
      userAgent: 'MaintenanceService/2.1',
      details: { tablesOptimized: 15, timeSpent: '30 minutes', performanceImprovement: '12%' }
    }
  ];

  // System metrics for logs
  const logMetrics = {
    totalLogs: auditLogs.length,
    todayLogs: auditLogs.filter(log => log.timestamp.startsWith('2024-03-15')).length,
    securityAlerts: auditLogs.filter(log => log.category === 'security').length,
    criticalEvents: auditLogs.filter(log => log.severity === 'critical').length,
    uniqueUsers: new Set(auditLogs.map(log => log.user)).size,
    systemEvents: auditLogs.filter(log => log.userRole === 'system').length
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'security': return 'bg-red-100 text-red-800';
      case 'user_management': return 'bg-purple-100 text-purple-800';
      case 'academic': return 'bg-blue-100 text-blue-800';
      case 'financial': return 'bg-green-100 text-green-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'user_created': return <UserPlus className="h-4 w-4" />;
      case 'user_login': return <LogIn className="h-4 w-4" />;
      case 'user_logout': return <LogOut className="h-4 w-4" />;
      case 'grade_updated': return <Edit className="h-4 w-4" />;
      case 'fee_payment_processed': return <CheckCircle className="h-4 w-4" />;
      case 'security_alert': return <AlertTriangle className="h-4 w-4" />;
      case 'backup_completed': return <Database className="h-4 w-4" />;
      case 'system_configuration_changed': return <Settings className="h-4 w-4" />;
      case 'database_maintenance': return <Activity className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    if (selectedTab !== 'all' && log.category !== selectedTab) return false;
    if (searchTerm && !log.description.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !log.user.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const logCategories = [
    { id: 'all', name: 'All Logs', count: auditLogs.length },
    { id: 'security', name: 'Security', count: auditLogs.filter(log => log.category === 'security').length },
    { id: 'user_management', name: 'User Management', count: auditLogs.filter(log => log.category === 'user_management').length },
    { id: 'academic', name: 'Academic', count: auditLogs.filter(log => log.category === 'academic').length },
    { id: 'financial', name: 'Financial', count: auditLogs.filter(log => log.category === 'financial').length },
    { id: 'system', name: 'System', count: auditLogs.filter(log => log.category === 'system').length }
  ];

  return (
    <DashboardLayout title="Audit Logs" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Audit Logs & System Activity</h2>
            <p className="text-gray-600">Monitor system activities, user actions, and security events</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button onClick={() => setRealTimeModalOpen(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Real-time Monitor
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xl font-bold">{logMetrics.todayLogs}</div>
                  <p className="text-sm text-gray-600">Today's Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <div className="text-xl font-bold text-red-600">{logMetrics.securityAlerts}</div>
                  <p className="text-sm text-gray-600">Security Alerts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-xl font-bold text-purple-600">{logMetrics.criticalEvents}</div>
                  <p className="text-sm text-gray-600">Critical Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-xl font-bold">{logMetrics.uniqueUsers}</div>
                  <p className="text-sm text-gray-600">Active Users</p>
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
                    placeholder="Search logs by user, action, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle>System Audit Trail</CardTitle>
            <CardDescription>Detailed log of all system activities and user actions</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                {logCategories.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-6">
                <div className="space-y-4">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mt-1">
                            {getActionIcon(log.action)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold">{log.description}</h3>
                              <Badge className={getSeverityColor(log.severity)}>
                                {log.severity.toUpperCase()}
                              </Badge>
                              <Badge className={getCategoryColor(log.category)} variant="outline">
                                {log.category.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mt-2">
                              <div>
                                <span className="font-medium">User:</span> {log.user} ({log.userRole})
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {log.timestamp}
                              </div>
                              <div>
                                <span className="font-medium">IP:</span> {log.ipAddress}
                              </div>
                            </div>
                            {log.details && Object.keys(log.details).length > 0 && (
                              <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                <div className="font-medium mb-1">Additional Details:</div>
                                <div className="grid grid-cols-2 gap-2">
                                  {Object.entries(log.details).map(([key, value]) => (
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
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(log)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                      
                      {log.userAgent !== 'Unknown' && (
                        <div className="text-xs text-gray-500 mt-2">
                          <span className="font-medium">User Agent:</span> {log.userAgent}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {filteredLogs.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No logs found matching your criteria.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">System Status</span>
                  <Badge className="bg-green-100 text-green-800">SECURE</Badge>
                </div>
                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                  <span className="text-sm">Failed Login Attempts (24h)</span>
                  <span className="font-semibold text-yellow-600">3</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Active Admin Sessions</span>
                  <span className="font-semibold text-blue-600">2</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">Last Security Scan</span>
                  <span className="font-semibold text-purple-600">2 hours ago</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                  <span className="text-sm">System Uptime</span>
                  <span className="font-semibold text-green-600">99.8%</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                  <span className="text-sm">Database Queries/sec</span>
                  <span className="font-semibold text-blue-600">142</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                  <span className="text-sm">Active Connections</span>
                  <span className="font-semibold text-purple-600">89</span>
                </div>
                <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                  <span className="text-sm">Last Backup</span>
                  <span className="font-semibold text-orange-600">This morning</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Monitor Modal */}
        <RealTimeMonitor
          isOpen={realTimeModalOpen}
          onClose={() => setRealTimeModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
