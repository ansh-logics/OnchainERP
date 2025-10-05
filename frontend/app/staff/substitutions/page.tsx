"use client";

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, BookOpen, Building, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { getCurrentUser } from "@/lib/auth";
import CreateSubstitutionRequest from '@/components/faculty/CreateSubstitutionRequest';

interface SubstitutionRequest {
  id: string;
  date: string;
  status: 'pending' | 'approved' | 'confirmed' | 'rejected';
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
  createdAt: string;
}

interface SubstitutionHistory {
  asAbsentFaculty: SubstitutionRequest[];
  asSubstituteFaculty: SubstitutionRequest[];
  total: number;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  approved: 'bg-blue-100 text-blue-800 border-blue-300',
  confirmed: 'bg-green-100 text-green-800 border-green-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
};

export default function FacultySubstitutionPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'history' | 'create'>('requests');
  const [substitutionRequests, setSubstitutionRequests] = useState<SubstitutionRequest[]>([]);
  const [substitutionHistory, setSubstitutionHistory] = useState<SubstitutionHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    // Allow faculty role to access staff substitutions
    if (currentUser.role !== 'faculty') {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }
    setUser(currentUser);
  }, [router]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchSubstitutionRequests();
    } else if (activeTab === 'history') {
      fetchSubstitutionHistory();
    }
  }, [activeTab]);

  const fetchSubstitutionRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faculty-services/substitutions/substitution-requests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubstitutionRequests(data.data);
      } else {
        toast.error('Failed to fetch substitution requests');
      }
    } catch (error) {
      console.error('Error fetching substitution requests:', error);
      toast.error('Error fetching substitution requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubstitutionHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/faculty-services/substitutions/substitution-history', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubstitutionHistory(data.data);
      } else {
        toast.error('Failed to fetch substitution history');
      }
    } catch (error) {
      console.error('Error fetching substitution history:', error);
      toast.error('Error fetching substitution history');
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (id: string, action: 'confirm' | 'reject', remarks?: string) => {
    try {
      const response = await fetch(`/api/faculty-services/substitutions/substitution-requests/${id}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ action, remarks }),
      });

      if (response.ok) {
        toast.success(`Substitution request ${action}ed successfully`);
        fetchSubstitutionRequests();
      } else {
        const error = await response.json();
        toast.error(error.message || `Failed to ${action} request`);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Error ${action}ing request`);
    }
  };

  const SubstitutionRequestCard = ({ request }: { request: SubstitutionRequest }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {request.course.name} ({request.course.code})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Section: {request.section.name}
            </p>
          </div>
          <Badge className={cn('border', statusColors[request.status])}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(request.date), 'PPP')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {request.timetable.startTime} - {request.timetable.endTime}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {request.absentFaculty.user.name}
            </span>
          </div>
          {request.timetable.classroom && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {request.timetable.classroom.name}
              </span>
            </div>
          )}
        </div>

        {request.reason && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-1">Reason:</p>
            <p className="text-sm text-muted-foreground">{request.reason}</p>
          </div>
        )}

        {request.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={() => respondToRequest(request.id, 'confirm')}
              className="bg-green-600 hover:bg-green-700"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => respondToRequest(request.id, 'reject', 'Not available')}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              Decline
            </Button>
          </div>
        )}

        {request.remarks && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Remarks:</p>
            <p className="text-sm">{request.remarks}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const HistoryCard = ({ request, type }: { request: SubstitutionRequest; type: 'absent' | 'substitute' }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {request.course.name} ({request.course.code})
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {type === 'absent' 
                ? `Substitute: ${request.substituteFaculty.user.name}` 
                : `For: ${request.absentFaculty.user.name}`}
            </p>
          </div>
          <Badge className={cn('border', statusColors[request.status])}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {format(new Date(request.date), 'PPP')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {request.timetable.startTime} - {request.timetable.endTime}
            </span>
          </div>
        </div>
        
        {request.reason && (
          <div className="mt-3">
            <p className="text-sm text-muted-foreground">{request.reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <DashboardLayout title="Faculty Substitutions" userRole={user.role as any}>
      <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Faculty Substitutions</h1>
          <p className="text-muted-foreground">
            Manage your substitution requests and view your history
          </p>
        </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'requests' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('requests')}
            className="px-4 py-2"
          >
            Pending Requests
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="px-4 py-2"
          >
            History
          </Button>
          <Button
            variant={activeTab === 'create' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('create')}
            className="px-4 py-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Request Substitution
          </Button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {activeTab === 'requests' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                Substitution Requests for You ({substitutionRequests.length})
              </h2>
              {substitutionRequests.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No pending substitution requests at the moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                substitutionRequests.map((request) => (
                  <SubstitutionRequestCard key={request.id} request={request} />
                ))
              )}
            </div>
          )}

          {activeTab === 'history' && substitutionHistory && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  When You Were Absent ({substitutionHistory.asAbsentFaculty.length})
                </h2>
                {substitutionHistory.asAbsentFaculty.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground">No absence records found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  substitutionHistory.asAbsentFaculty.map((request) => (
                    <HistoryCard key={request.id} request={request} type="absent" />
                  ))
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">
                  When You Substituted ({substitutionHistory.asSubstituteFaculty.length})
                </h2>
                {substitutionHistory.asSubstituteFaculty.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground">No substitution records found.</p>
                    </CardContent>
                  </Card>
                ) : (
                  substitutionHistory.asSubstituteFaculty.map((request) => (
                    <HistoryCard key={request.id} request={request} type="substitute" />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div>
              <CreateSubstitutionRequest />
            </div>
          )}
        </>
      )}
      </div>
    </DashboardLayout>
  );
}
