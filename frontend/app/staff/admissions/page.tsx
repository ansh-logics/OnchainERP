"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DataGrid, Column } from "@/components/ui/data-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  MessageSquare,
  Clock,
  User,
  Mail,
  Phone,
  Calendar
} from "lucide-react"
import { mockApplications } from "@/lib/mock-data"

const navigation = [
  { name: "Dashboard", href: "/staff", icon: "BarChart3" as const },
  { name: "Admissions Desk", href: "/staff/admissions", icon: "FileText" as const, current: true },
  { name: "Fees Desk", href: "/staff/fees", icon: "DollarSign" as const },
  { name: "Hostel Desk", href: "/staff/hostel", icon: "User" as const },
  { name: "Library Desk", href: "/staff/library", icon: "BookOpen" as const },
  { name: "Academics Desk", href: "/staff/academics", icon: "GraduationCap" as const },
  { name: "Reports", href: "/staff/reports", icon: "FileText" as const },
]

export default function StaffAdmissionsPage() {
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_docs'>('approve')

  const applications = mockApplications

  const applicationColumns: Column[] = [
    {
      key: 'studentName',
      title: 'Student Name',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{record.email}</div>
        </div>
      )
    },
    {
      key: 'program',
      title: 'Program',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'submittedDate',
      title: 'Submitted',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => {
        const variants: Record<string, any> = {
          draft: { variant: 'outline', icon: Clock, color: 'text-gray-600' },
          submitted: { variant: 'outline', icon: Clock, color: 'text-blue-600' },
          under_review: { variant: 'outline', icon: AlertTriangle, color: 'text-yellow-600' },
          approved: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
          rejected: { variant: 'destructive', icon: XCircle, color: 'text-red-600' },
          documents_required: { variant: 'outline', icon: FileText, color: 'text-orange-600' }
        }
        const config = variants[value] || variants.submitted
        const Icon = config.icon
        
        return (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.color}`} />
            <Badge variant={config.variant}>
              {value.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'documents',
      title: 'Documents',
      render: (value) => {
        const verified = value.filter((doc: any) => doc.status === 'verified').length
        const total = value.length
        const allVerified = verified === total
        
        return (
          <div className="flex items-center gap-2">
            <div className={`text-sm font-medium ${allVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {verified}/{total}
            </div>
            {allVerified ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            )}
          </div>
        )
      }
    }
  ]

  const handleReviewApplication = (application: any) => {
    setSelectedApplication(application)
    setReviewNotes(application.reviewNotes || '')
    setIsReviewDialogOpen(true)
  }

  const handleSubmitReview = () => {
    console.log('Submitting review:', {
      applicationId: selectedApplication.id,
      action: reviewAction,
      notes: reviewNotes
    })
    
    // Update application status (in real app, this would be handled by the backend)
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      request_docs: 'documents_required'
    }
    
    alert(`Application ${statusMap[reviewAction]}! Student will be notified via email.`)
    setIsReviewDialogOpen(false)
    setSelectedApplication(null)
    setReviewNotes('')
  }

  const getDocumentStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-50 border-green-200'
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200'
      case 'uploaded': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const pendingCount = applications.filter(app => app.status === 'submitted' || app.status === 'under_review').length
  const reviewCount = applications.filter(app => app.status === 'under_review').length
  const approvedCount = applications.filter(app => app.status === 'approved').length

  return (
    <AuthGuard allowedRoles={["staff", "admin"]}>
      <DashboardLayout userRole="staff" navigation={navigation}>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Admissions Desk</h1>
            <p className="text-muted-foreground">Review and process student admission applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">
                  Applications awaiting review
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Under Review</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{reviewCount}</div>
                <p className="text-xs text-muted-foreground">
                  Currently being reviewed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">
                  Applications approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
                <p className="text-xs text-muted-foreground">
                  This admission cycle
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Applications Table */}
          <DataGrid
            data={applications}
            columns={applicationColumns}
            title="Application Queue"
            searchable={true}
            filterable={true}
            exportable={true}
            selectable={true}
            actions={[
              {
                label: 'Review',
                onClick: (record) => handleReviewApplication(record),
                variant: 'default'
              },
              {
                label: 'View Details',
                onClick: (record) => setSelectedApplication(record),
                variant: 'outline'
              }
            ]}
            bulkActions={[
              {
                label: 'Approve Selected',
                onClick: (records) => console.log('Bulk approve:', records),
                variant: 'default'
              },
              {
                label: 'Request Documents',
                onClick: (records) => console.log('Bulk request docs:', records),
                variant: 'outline'
              }
            ]}
          />

          {/* Review Dialog */}
          <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Review Application - {selectedApplication?.studentName}
                </DialogTitle>
                <DialogDescription>
                  Review the application details and make a decision
                </DialogDescription>
              </DialogHeader>
              
              {selectedApplication && (
                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="details">Application Details</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="review">Review & Decision</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{selectedApplication.studentName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedApplication.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedApplication.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Applied: {selectedApplication.submittedDate ? new Date(selectedApplication.submittedDate).toLocaleDateString() : 'Not submitted'}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Program Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="font-medium">Preferred Program:</span>
                            <p className="text-muted-foreground">{selectedApplication.program}</p>
                          </div>
                          <div>
                            <span className="font-medium">Application Status:</span>
                            <div className="mt-1">
                              <Badge variant={selectedApplication.status === 'approved' ? 'default' : 'outline'}>
                                {selectedApplication.status.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {selectedApplication.reviewNotes && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Previous Review Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{selectedApplication.reviewNotes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="documents" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedApplication.documents.map((doc: any, index: number) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-medium">{doc.type}</h3>
                              <Badge className={getDocumentStatusColor(doc.status)}>
                                {doc.status}
                              </Badge>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              {doc.status === 'uploaded' && (
                                <>
                                  <Button size="sm" variant="default">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="review" className="space-y-4">
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium">Decision</Label>
                        <div className="flex gap-4 mt-2">
                          <Button
                            variant={reviewAction === 'approve' ? 'default' : 'outline'}
                            onClick={() => setReviewAction('approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            variant={reviewAction === 'request_docs' ? 'default' : 'outline'}
                            onClick={() => setReviewAction('request_docs')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Request Documents
                          </Button>
                          <Button
                            variant={reviewAction === 'reject' ? 'destructive' : 'outline'}
                            onClick={() => setReviewAction('reject')}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reviewNotes">Review Notes</Label>
                        <Textarea
                          id="reviewNotes"
                          placeholder="Add notes about your decision..."
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end gap-3">
                        <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSubmitReview}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
