"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Clock, User, BookOpen, Building, Search, Filter, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SubstitutionRequest {
  id: string;
  date: string;
  status: 'pending' | 'approved' | 'confirmed' | 'rejected' | 'cancelled';
  reason?: string;
  remarks?: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  section: {
    id: string;
    name: string;
  };
  timetable: {
    startTime: string;
    endTime: string;
    period: number;
    classroom?: {
      name: string;
    };
  };
  absentFaculty: {
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
    };
  };
  substituteFaculty: {
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
    };
  };
  approver?: {
    id: string;
    name: string;
  };
  confirmer?: {
    id: string;
    name: string;
  };
  createdAt: string;
  approvedAt?: string;
  confirmedAt?: string;
}

interface SubstitutionStats {
  totalSubstitutions: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  departmentStats: Array<{
    department: {
      name: string;
      shortName: string;
    };
    count: number;
  }>;
  mostActiveFaculty: Array<{
    absentFaculty: {
      user: {
        name: string;
      };
      department: {
        name: string;
      };
    };
    count: number;
  }>;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-blue-100 text-blue-800 border-blue-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-300',
};

export default function AdminSubstitutionsPage() {
  const [substitutions, setSubstitutions] = useState<SubstitutionRequest[]>([]);
  const [stats, setStats] = useState<SubstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    date: '',
    status: '',
    search: '',
  });
  const [selectedSubstitution, setSelectedSubstitution] = useState<SubstitutionRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: 'approve' | 'reject' | 'cancel';
    remarks: string;
  }>({
    open: false,
    action: 'approve',
    remarks: '',
  });

  useEffect(() => {
    fetchSubstitutions();
    fetchStats();
  }, [filters]);

  const fetchSubstitutions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.date) params.append('date', filters.date);
      if (filters.status) params.append('status', filters.status);
      
      const response = await fetch(`/api/admin/faculty-substitutions?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        let filteredData = data.data;
        
        // Apply search filter
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredData = filteredData.filter((sub: SubstitutionRequest) =>
            sub.absentFaculty.user.name.toLowerCase().includes(searchLower) ||
            sub.substituteFaculty.user.name.toLowerCase().includes(searchLower) ||
            sub.course.name.toLowerCase().includes(searchLower) ||
            sub.course.code.toLowerCase().includes(searchLower)
          );
        }
        
        setSubstitutions(filteredData);
      } else {
        toast.error('Failed to fetch substitutions');
      }
    } catch (error) {
      console.error('Error fetching substitutions:', error);
      toast.error('Error fetching substitutions');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/faculty-substitutions/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAction = async () => {
    if (!selectedSubstitution) return;

    try {
      const endpoint = actionDialog.action === 'cancel' 
        ? `/api/admin/faculty-substitutions/${selectedSubstitution.id}/cancel`
        : `/api/admin/faculty-substitutions/${selectedSubstitution.id}/${actionDialog.action}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ remarks: actionDialog.remarks }),
      });

      if (response.ok) {
        toast.success(`Substitution ${actionDialog.action}d successfully`);
        fetchSubstitutions();
        setActionDialog({ open: false, action: 'approve', remarks: '' });
        setSelectedSubstitution(null);
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${actionDialog.action} substitution`);
      }
    } catch (error) {
      console.error(`Error ${actionDialog.action}ing substitution:`, error);
      toast.error(`Error ${actionDialog.action}ing substitution`);
    }
  };

  const SubstitutionCard = ({ substitution }: { substitution: SubstitutionRequest }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {substitution.course.name} ({substitution.course.code})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Section: {substitution.section.name}
            </p>
          </div>
          <Badge className={cn('border', statusColors[substitution.status])}>
            {substitution.status.charAt(0).toUpperCase() + substitution.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(substitution.date), 'PPP')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {substitution.timetable.startTime} - {substitution.timetable.endTime}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium">Absent Faculty:</p>
            <p className="text-sm text-muted-foreground">
              {substitution.absentFaculty.user.name} ({substitution.absentFaculty.department.name})
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Substitute Faculty:</p>
            <p className="text-sm text-muted-foreground">
              {substitution.substituteFaculty.user.name} ({substitution.substituteFaculty.department.name})
            </p>
          </div>
          {substitution.timetable.classroom && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {substitution.timetable.classroom.name}
              </span>
            </div>
          )}
        </div>

        {substitution.reason && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Reason:</p>
            <p className="text-sm text-muted-foreground">{substitution.reason}</p>
          </div>
        )}

        {substitution.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedSubstitution(substitution);
                setActionDialog({ open: true, action: 'approve', remarks: '' });
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSubstitution(substitution);
                setActionDialog({ open: true, action: 'reject', remarks: '' });
              }}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {(substitution.status === 'approved' || substitution.status === 'confirmed') && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSubstitution(substitution);
              setActionDialog({ open: true, action: 'cancel', remarks: '' });
            }}
            className="border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </Button>
        )}

        {substitution.remarks && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Admin Remarks:</p>
            <p className="text-sm">{substitution.remarks}</p>
          </div>
        )}

        <div className="mt-4 text-xs text-muted-foreground">
          Requested: {format(new Date(substitution.createdAt), 'PPp')}
          {substitution.approvedAt && (
            <span className="ml-4">
              Approved: {format(new Date(substitution.approvedAt), 'PPp')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Faculty Substitutions</h1>
        <p className="text-muted-foreground">
          Manage faculty substitution requests and view analytics
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{stats.totalSubstitutions}</div>
              <p className="text-xs text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          {stats.statusBreakdown.map((stat) => (
            <Card key={stat.status}>
              <CardContent className="p-6">
                <div className="text-2xl font-bold">{stat.count}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.status.charAt(0).toUpperCase() + stat.status.slice(1)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search faculty or course..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <Button
              onClick={() => setFilters({ date: '', status: '', search: '' })}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Substitutions List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : substitutions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No substitution requests found.
            </p>
          </CardContent>
        </Card>
      ) : (
        substitutions.map((substitution) => (
          <SubstitutionCard key={substitution.id} substitution={substitution} />
        ))
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action.charAt(0).toUpperCase() + actionDialog.action.slice(1)} Substitution Request
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to {actionDialog.action} this substitution request?
            </p>
            {selectedSubstitution && (
              <div className="mb-4 p-3 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Course:</strong> {selectedSubstitution.course.name}
                </p>
                <p className="text-sm">
                  <strong>Date:</strong> {format(new Date(selectedSubstitution.date), 'PPP')}
                </p>
                <p className="text-sm">
                  <strong>Faculty:</strong> {selectedSubstitution.absentFaculty.user.name} → {selectedSubstitution.substituteFaculty.user.name}
                </p>
              </div>
            )}
            <Textarea
              placeholder={`Enter remarks for ${actionDialog.action}...`}
              value={actionDialog.remarks}
              onChange={(e) => setActionDialog(prev => ({ ...prev, remarks: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog(prev => ({ ...prev, open: false }))}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              className={cn(
                actionDialog.action === 'approve' && "bg-blue-600 hover:bg-blue-700",
                actionDialog.action === 'reject' && "bg-red-600 hover:bg-red-700",
                actionDialog.action === 'cancel' && "bg-gray-600 hover:bg-gray-700"
              )}
            >
              {actionDialog.action.charAt(0).toUpperCase() + actionDialog.action.slice(1)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
