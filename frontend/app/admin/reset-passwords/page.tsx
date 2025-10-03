"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCurrentUser } from "@/lib/auth";
import { 
  Key,
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Loader2,
  Copy,
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";

interface PasswordResetRequest {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    studentId?: string;
    facultyId?: string;
    phone?: string;
  };
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  reviewNote?: string;
  tempPassword?: string;
}

export default function ResetPasswordsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState<PasswordResetRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PasswordResetRequest[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'admin') {
      setUser(currentUser);
      loadPasswordResetRequests();
      loadStats();
    } else {
      router.push('/login');
    }
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    filterRequests();
  }, [requests, selectedStatus, searchTerm]);

  const loadPasswordResetRequests = async () => {
    try {
      setIsLoading(true);
      // Mock API call - replace with actual API
      const mockRequests: PasswordResetRequest[] = [
        {
          id: '1',
          user: {
            id: 'u1',
            name: 'John Doe',
            email: 'john.doe@student.edu',
            role: 'student',
            studentId: 'STU001',
            phone: '9876543210'
          },
          reason: 'I forgot my password and cannot access my account. I need to reset it to access my course materials.',
          status: 'pending',
          requestedAt: '2024-10-15T10:30:00Z'
        },
        {
          id: '2',
          user: {
            id: 'u2',
            name: 'Dr. Sarah Smith',
            email: 'sarah.smith@faculty.edu',
            role: 'faculty',
            facultyId: 'FAC001',
            phone: '9876543211'
          },
          reason: 'My account was compromised and I need to reset my password immediately for security reasons.',
          status: 'approved',
          requestedAt: '2024-10-14T09:15:00Z',
          reviewedBy: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@college.edu'
          },
          reviewedAt: '2024-10-14T10:00:00Z',
          reviewNote: 'Security concern addressed. Password reset approved.',
          tempPassword: 'TempPass123!'
        },
        {
          id: '3',
          user: {
            id: 'u3',
            name: 'Jane Wilson',
            email: 'jane.wilson@student.edu',
            role: 'student',
            studentId: 'STU002'
          },
          reason: 'Need access for exam preparation.',
          status: 'rejected',
          requestedAt: '2024-10-13T16:45:00Z',
          reviewedBy: {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@college.edu'
          },
          reviewedAt: '2024-10-13T17:00:00Z',
          reviewNote: 'Insufficient reason provided. Please try account recovery first.'
        }
      ];
      setRequests(mockRequests);
    } catch (err) {
      setError('Failed to load password reset requests');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Mock API call - replace with actual API
      const mockStats = {
        byStatus: {
          pending: 1,
          approved: 1,
          rejected: 1,
          completed: 0
        },
        recentRequests: 3,
        total: 3
      };
      setStats(mockStats);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(req => 
        req.user.name.toLowerCase().includes(term) ||
        req.user.email.toLowerCase().includes(term) ||
        req.reason.toLowerCase().includes(term) ||
        req.user.role.toLowerCase().includes(term) ||
        (req.user.studentId && req.user.studentId.toLowerCase().includes(term)) ||
        (req.user.facultyId && req.user.facultyId.toLowerCase().includes(term))
      );
    }

    setFilteredRequests(filtered);
  };

  const handleReviewRequest = async () => {
    if (!selectedRequest || !reviewAction) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (reviewAction === 'approve') {
        const tempPassword = 'TempPass' + Math.random().toString(36).substr(2, 8) + '!';
        setSuccess(`Password reset approved. Temporary password: ${tempPassword}`);
      } else {
        setSuccess('Password reset request rejected successfully');
      }
      
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setReviewAction(null);
      setReviewNote('');
      loadPasswordResetRequests();
      loadStats();
    } catch (err) {
      setError('Failed to review password reset request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openReviewModal = (request: PasswordResetRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNote('');
    setIsReviewModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return Clock;
      case 'approved': return CheckCircle;
      case 'rejected': return XCircle;
      case 'completed': return CheckCircle;
      default: return AlertCircle;
    }
  };

  if (isLoading || !user) {
    return (
      <DashboardLayout title="Reset Passwords" userRole="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Reset Passwords" userRole="admin">
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Password Reset Management</h2>
            <p className="text-muted-foreground">Review and manage user password reset requests</p>
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.byStatus.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-green-600">{stats.byStatus.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.byStatus.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                  </div>
                  <Key className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="requests">Password Reset Requests</TabsTrigger>
            <TabsTrigger value="approved">Approved Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search by name, email, ID, or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={selectedStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus('all')}
                    >
                      All ({requests.length})
                    </Button>
                    <Button
                      variant={selectedStatus === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus('pending')}
                    >
                      Pending ({stats?.byStatus.pending || 0})
                    </Button>
                    <Button
                      variant={selectedStatus === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus('approved')}
                    >
                      Approved ({stats?.byStatus.approved || 0})
                    </Button>
                    <Button
                      variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedStatus('rejected')}
                    >
                      Rejected ({stats?.byStatus.rejected || 0})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requests List */}
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const StatusIcon = getStatusIcon(request.status);
                
                return (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <h3 className="font-semibold">{request.user.name}</h3>
                            </div>
                            <Badge className={getStatusBadgeVariant(request.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {request.status}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              <Shield className="h-3 w-3 mr-1" />
                              {request.user.role}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{request.user.email}</span>
                              </div>
                              {request.user.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">{request.user.phone}</span>
                                </div>
                              )}
                              {(request.user.studentId || request.user.facultyId) && (
                                <div className="flex items-center gap-2">
                                  <Eye className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">
                                    ID: {request.user.studentId || request.user.facultyId}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">
                                  Requested: {new Date(request.requestedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {request.reviewedAt && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm">
                                    Reviewed: {new Date(request.reviewedAt).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mb-4">
                            <Label className="text-sm font-medium text-gray-700">Reason:</Label>
                            <p className="text-sm text-gray-600 mt-1 p-3 bg-gray-50 rounded-lg">
                              {request.reason}
                            </p>
                          </div>

                          {request.reviewNote && (
                            <div className="mb-4">
                              <Label className="text-sm font-medium text-gray-700">Admin Note:</Label>
                              <p className="text-sm text-gray-600 mt-1 p-3 bg-blue-50 rounded-lg">
                                {request.reviewNote}
                              </p>
                            </div>
                          )}

                          {request.tempPassword && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <Label className="text-sm font-medium text-green-800">Temporary Password:</Label>
                              <div className="flex items-center gap-2 mt-2">
                                <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                                  {request.tempPassword}
                                </code>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => copyToClipboard(request.tempPassword!)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-xs text-green-700 mt-2">
                                Share this password securely with the user
                              </p>
                            </div>
                          )}
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2 ml-4">
                            <Button 
                              size="sm"
                              onClick={() => openReviewModal(request, 'approve')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewModal(request, 'reject')}
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {filteredRequests.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Key className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No requests found</h3>
                    <p className="text-gray-500">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'Try adjusting your search or filter criteria'
                        : 'No password reset requests have been submitted yet'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Recently Approved Password Resets</CardTitle>
                <CardDescription>Users who have received new temporary passwords</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {requests.filter(req => req.status === 'approved').map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div>
                        <h4 className="font-medium">{request.user.name}</h4>
                        <p className="text-sm text-gray-600">{request.user.email}</p>
                        <p className="text-xs text-gray-500">
                          Approved on {new Date(request.reviewedAt!).toLocaleDateString()}
                        </p>
                      </div>
                      {request.tempPassword && (
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                            {request.tempPassword}
                          </code>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => copyToClipboard(request.tempPassword!)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Review Modal */}
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Password Reset Request
              </DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <>Review the password reset request from {selectedRequest.user.name}</>
                )}
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">User Information</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p><strong>Name:</strong> {selectedRequest.user.name}</p>
                    <p><strong>Email:</strong> {selectedRequest.user.email}</p>
                    <p><strong>Role:</strong> {selectedRequest.user.role}</p>
                    {(selectedRequest.user.studentId || selectedRequest.user.facultyId) && (
                      <p><strong>ID:</strong> {selectedRequest.user.studentId || selectedRequest.user.facultyId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Request Reason</Label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{selectedRequest.reason}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reviewNote" className="text-sm font-medium">
                    Admin Note {reviewAction === 'reject' ? '(Required)' : '(Optional)'}
                  </Label>
                  <Textarea
                    id="reviewNote"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    placeholder={
                      reviewAction === 'approve' 
                        ? 'Add any notes about this approval...'
                        : 'Please provide a reason for rejection...'
                    }
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReviewRequest}
                disabled={isSubmitting || (reviewAction === 'reject' && !reviewNote.trim())}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {reviewAction === 'approve' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve & Reset Password
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}