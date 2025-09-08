"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CreditCard,
  Receipt,
  AlertCircle,
  Plus,
  Search,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"

interface FeeTransaction {
  _id: string
  category: string
  amount: number
  description: string
  status: 'paid' | 'pending' | 'overdue'
  dueDate?: string
  paidDate?: string
  referenceNumber: string
  academicYear: string
  semester: number
  paymentMethod?: string
  notes?: string
  createdAt: string
}

export function StudentFinance() {
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [selectedFee, setSelectedFee] = useState<FeeTransaction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'upi',
    transactionRef: '',
    notes: ''
  })

  useEffect(() => {
    fetchStudentFees()
  }, [])

  const fetchStudentFees = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const studentId = localStorage.getItem("studentId") // Assuming student ID is stored
      
      const response = await fetch(`/api/finance/students/${studentId}/fees?academicYear=2024-2025`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setFeeTransactions(data.data.fees || [])
      } else {
        setError(data.message || 'Failed to fetch fee information')
      }
    } catch (error) {
      console.error('Student fees fetch error:', error)
      setError('Failed to load fee information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitPayment = async () => {
    if (!selectedFee) return
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/finance/students/submit-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          transactionId: selectedFee._id,
          paymentMethod: paymentData.paymentMethod,
          transactionRef: paymentData.transactionRef,
          notes: paymentData.notes
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchStudentFees()
        setIsPaymentDialogOpen(false)
        setSelectedFee(null)
        setPaymentData({ paymentMethod: 'upi', transactionRef: '', notes: '' })
        alert("Payment submitted successfully! Awaiting verification.")
      } else {
        alert(data.message || "Failed to submit payment")
      }
    } catch (error) {
      console.error('Payment submission error:', error)
      alert("Failed to submit payment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredFees = feeTransactions.filter(fee => {
    const matchesSearch = fee.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || fee.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalFees = feeTransactions.reduce((sum, fee) => sum + fee.amount, 0)
  const paidFees = feeTransactions.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount, 0)
  const pendingFees = feeTransactions.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0)
  const overdueFees = feeTransactions.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading fee information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchStudentFees}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground">View and pay your academic fees</p>
        </div>
      </div>

      {/* Fee Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalFees / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Academic Year 2024-25</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Fees</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{(paidFees / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalFees > 0 ? Math.round((paidFees / totalFees) * 100) : 0}% completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{(pendingFees / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {feeTransactions.filter(f => f.status === 'pending').length} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Fees</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{(overdueFees / 100).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {feeTransactions.filter(f => f.status === 'overdue').length} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fee List */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Details</CardTitle>
          <CardDescription>Your academic fees for the current year</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search fees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredFees.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fee Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => (
                    <TableRow key={fee._id}>
                      <TableCell className="font-medium">
                        {fee.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>{fee.description}</TableCell>
                      <TableCell className="font-medium">
                        ₹{(fee.amount / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      <TableCell className="text-right">
                        {fee.status === 'pending' || fee.status === 'overdue' ? (
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedFee(fee)
                              setIsPaymentDialogOpen(true)
                            }}
                          >
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No fees found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Your fee information will appear here."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overdue Alert */}
      {overdueFees > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Overdue Fees Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              You have overdue fees totaling ₹{(overdueFees / 100).toLocaleString()}. 
              Please pay immediately to avoid late charges and academic holds.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Fee Payment</DialogTitle>
            <DialogDescription>
              Submit your payment details for verification by the finance team.
            </DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium">{selectedFee.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                <p className="text-sm text-muted-foreground">{selectedFee.description}</p>
                <p className="text-lg font-bold">₹{(selectedFee.amount / 100).toLocaleString()}</p>
              </div>
              
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData({...paymentData, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="dd">Demand Draft</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="transactionRef">Transaction Reference/Receipt Number</Label>
                  <Input
                    id="transactionRef"
                    value={paymentData.transactionRef}
                    onChange={(e) => setPaymentData({...paymentData, transactionRef: e.target.value})}
                    placeholder="Enter transaction ID or receipt number"
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    placeholder="Additional details about the payment"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
