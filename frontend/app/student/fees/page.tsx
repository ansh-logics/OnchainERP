"use client"

import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DataGrid, Column } from "@/components/ui/data-grid"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { 
  CreditCard, 
  Download, 
  Receipt, 
  AlertTriangle, 
  CheckCircle,
  DollarSign,
  Calendar,
  FileText,
  Wallet
} from "lucide-react"
import { mockFees, mockDashboardStats } from "@/lib/mock-data"

const navigation = [
  { name: "Dashboard", href: "/student", icon: "BarChart3" as const },
  { name: "Admissions", href: "/student/admissions", icon: "FileText" as const },
  { name: "Fees", href: "/student/fees", icon: "DollarSign" as const, current: true },
  { name: "Hostel", href: "/student/hostel", icon: "User" as const },
  { name: "Library", href: "/student/library", icon: "BookOpen" as const },
  { name: "Academics", href: "/student/academics", icon: "GraduationCap" as const },
  { name: "Profile", href: "/student/profile", icon: "User" as const },
]

interface PaymentFormData {
  amount: number
  paymentMethod: string
  cardNumber: string
  expiryDate: string
  cvv: string
  nameOnCard: string
}

export default function StudentFeesPage() {
  const [selectedFee, setSelectedFee] = useState<any>(null)
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    amount: 0,
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  })
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const studentFees = mockFees
  const stats = mockDashboardStats.student

  const feeColumns: Column[] = [
    {
      key: 'type',
      title: 'Fee Type',
      sortable: true,
      render: (value) => (
        <div className="font-medium capitalize">
          {value.replace('_', ' ')} Fee
        </div>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (value) => (
        <div className="font-medium">
          ₹{value.toLocaleString()}
        </div>
      )
    },
    {
      key: 'dueDate',
      title: 'Due Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => {
        const variants: Record<string, any> = {
          paid: { variant: 'default', icon: CheckCircle, color: 'text-green-600' },
          pending: { variant: 'outline', icon: AlertTriangle, color: 'text-yellow-600' },
          overdue: { variant: 'destructive', icon: AlertTriangle, color: 'text-red-600' },
          partial: { variant: 'outline', icon: AlertTriangle, color: 'text-orange-600' }
        }
        const config = variants[value] || variants.pending
        const Icon = config.icon
        
        return (
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${config.color}`} />
            <Badge variant={config.variant}>
              {value.charAt(0).toUpperCase() + value.slice(1)}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'paidAmount',
      title: 'Paid Amount',
      render: (value, record) => (
        <div>
          {value ? `₹${value.toLocaleString()}` : '-'}
        </div>
      )
    },
    {
      key: 'paidDate',
      title: 'Paid Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    }
  ]

  const handlePayment = (fee: any) => {
    setSelectedFee(fee)
    setPaymentForm(prev => ({
      ...prev,
      amount: fee.amount - (fee.paidAmount || 0)
    }))
    setIsPaymentDialogOpen(true)
  }

  const handlePaymentSubmit = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update fee status (in real app, this would be handled by the backend)
    const updatedFee = {
      ...selectedFee,
      status: 'paid',
      paidAmount: selectedFee.amount,
      paidDate: new Date().toISOString(),
      receipt: `RCP${Date.now()}`
    }
    
    alert('Payment successful! Receipt will be emailed to you.')
    setIsProcessing(false)
    setIsPaymentDialogOpen(false)
    setSelectedFee(null)
  }

  const handleDownloadReceipt = (fee: any) => {
    // In a real app, this would download the actual receipt
    alert(`Downloading receipt for ${fee.receipt}`)
  }

  const totalPending = studentFees
    .filter(fee => fee.status === 'pending' || fee.status === 'overdue')
    .reduce((sum, fee) => sum + fee.amount, 0)

  const totalPaid = studentFees
    .filter(fee => fee.status === 'paid')
    .reduce((sum, fee) => sum + (fee.paidAmount || 0), 0)

  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout userRole="student" navigation={navigation}>
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Fee Management</h1>
            <p className="text-muted-foreground">View and pay your fees online</p>
          </div>

          {/* Fee Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pending</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">₹{totalPending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {studentFees.filter(f => f.status === 'pending' || f.status === 'overdue').length} pending fees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {studentFees.filter(f => f.status === 'paid').length} fees paid
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Semester</CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Semester 7</div>
                <p className="text-xs text-muted-foreground">
                  Academic Year 2023-24
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pending Fees Alert */}
          {totalPending > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <AlertTriangle className="h-5 w-5" />
                  Pending Fees - Action Required
                </CardTitle>
                <CardDescription className="text-red-700">
                  You have ₹{totalPending.toLocaleString()} in pending fees. Please pay by the due date to avoid late charges.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => {
                  const pendingFee = studentFees.find(f => f.status === 'pending' || f.status === 'overdue')
                  if (pendingFee) handlePayment(pendingFee)
                }}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay Now
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Fees Table */}
          <DataGrid
            data={studentFees}
            columns={feeColumns}
            title="Fee Details"
            searchable={true}
            exportable={true}
            actions={[
              {
                label: 'Pay Now',
                onClick: (record) => handlePayment(record),
                variant: 'default'
              },
              {
                label: 'Download Receipt',
                onClick: (record) => handleDownloadReceipt(record),
                variant: 'outline'
              }
            ]}
          />

          {/* Payment Dialog */}
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pay Fee
                </DialogTitle>
                <DialogDescription>
                  Complete your payment for {selectedFee?.type} fee
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Payment Summary */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Fee Type:</span>
                    <span className="capitalize">{selectedFee?.type} Fee</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Amount:</span>
                    <span className="text-lg font-bold">₹{paymentForm.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Due Date:</span>
                    <span>{selectedFee ? new Date(selectedFee.dueDate).toLocaleDateString() : ''}</span>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select 
                    value={paymentForm.paymentMethod} 
                    onValueChange={(value) => setPaymentForm(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="netbanking">Net Banking</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="wallet">Digital Wallet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Card Details (shown when card is selected) */}
                {paymentForm.paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nameOnCard">Name on Card</Label>
                      <Input
                        id="nameOnCard"
                        placeholder="Enter name as on card"
                        value={paymentForm.nameOnCard}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, nameOnCard: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          value={paymentForm.expiryDate}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handlePaymentSubmit} disabled={isProcessing}>
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay ₹{paymentForm.amount.toLocaleString()}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Your payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {studentFees.filter(fee => fee.status === 'paid').slice(0, 3).map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium capitalize">{fee.type} Fee</p>
                        <p className="text-sm text-muted-foreground">
                          Paid on {fee.paidDate ? new Date(fee.paidDate).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{fee.paidAmount?.toLocaleString()}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadReceipt(fee)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
