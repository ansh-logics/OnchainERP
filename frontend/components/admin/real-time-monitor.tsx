"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Activity,
  Pause,
  Play,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Download,
  Clock,
  User
} from "lucide-react";

interface RealTimeMonitorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RealTimeMonitor({ isOpen, onClose }: RealTimeMonitorProps) {
  const [isMonitoring, setIsMonitoring] = useState(true);
  interface LogEntry {
    id: number;
    timestamp: string;
    user: string;
    action: string;
    severity: 'info' | 'warning' | 'critical' | string;
    category: string;
    description: string;
  }

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    criticalEvents: 0,
    averageEventsPerMinute: 0,
    systemStatus: 'healthy'
  });

  // Simulate real-time log updates
  useEffect(() => {
    if (!isMonitoring || !isOpen) return;

    const interval = setInterval(() => {
      const newLog = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        user: ['admin@college.edu', 'system', 'priya.sharma@college.edu', 'rajesh.kumar@college.edu'][Math.floor(Math.random() * 4)],
        action: ['user_login', 'fee_payment_processed', 'grade_updated', 'system_backup', 'security_scan'][Math.floor(Math.random() * 5)],
        category: ['security', 'financial', 'academic', 'system', 'user_management'][Math.floor(Math.random() * 5)],
        severity: ['info', 'warning', 'critical'][Math.floor(Math.random() * 3)],
        description: [
          'User logged in successfully',
          'Fee payment processed',
          'Grade updated for student',
          'System backup completed',
          'Security scan initiated',
          'Database query executed',
          'File uploaded successfully'
        ][Math.floor(Math.random() * 7)]
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Keep only last 50 logs
      setStats(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1,
        criticalEvents: newLog.severity === 'critical' ? prev.criticalEvents + 1 : prev.criticalEvents,
        averageEventsPerMinute: Math.round((prev.totalEvents + 1) / ((Date.now() - startTime) / 60000))
      }));
    }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds

    const startTime = Date.now();

    return () => clearInterval(interval);
  }, [isMonitoring, isOpen]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="h-3 w-3" />;
      case 'warning': return <AlertTriangle className="h-3 w-3" />;
      case 'info': return <CheckCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const handleExportLiveLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,User,Action,Severity,Description\n"
      + logs.map(log => `${log.timestamp},${log.user},${log.action},${log.severity},${log.description}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `realtime_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time System Monitor
          </DialogTitle>
          <DialogDescription>
            Live monitoring of system activities and events
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isMonitoring ? "destructive" : "default"}
                onClick={() => setIsMonitoring(!isMonitoring)}
              >
                {isMonitoring ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </>
                )}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setLogs([])}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Button size="sm" variant="outline" onClick={handleExportLiveLogs}>
                <Download className="h-4 w-4 mr-1" />
                Export Live Data
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isMonitoring ? 'Monitoring Active' : 'Monitoring Paused'}
              </span>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-3">
                <div className="text-lg font-bold">{stats.totalEvents}</div>
                <p className="text-xs text-gray-600">Total Events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-lg font-bold text-red-600">{stats.criticalEvents}</div>
                <p className="text-xs text-gray-600">Critical Events</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="text-lg font-bold">{stats.averageEventsPerMinute}</div>
                <p className="text-xs text-gray-600">Events/min</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <p className="text-xs text-gray-600">System Status</p>
              </CardContent>
            </Card>
          </div>

          {/* Live Logs */}
          <div className="border rounded-lg">
            <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
              <h4 className="font-medium">Live Activity Stream</h4>
              <span className="text-sm text-gray-500">{logs.length} events</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {isMonitoring ? 'Waiting for events...' : 'Monitoring paused'}
                </div>
              ) : (
                <div className="divide-y">
                  {logs.map((log) => (
                    <div key={log.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getSeverityColor(log.severity)} text-xs`}>
                            {getSeverityIcon(log.severity)}
                            {log.severity.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{log.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.user}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close Monitor
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
