"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  AlertCircle,
  Download,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Check,
  X,
  Eye,
  FileText,
  Calendar,
  User,
  Building
} from "lucide-react"

interface Transaction {
  _id: string
  type: 'income' | 'expense'
  category: string
  amount: number
  description: string
  student?: {
    _id: string
    name: string
    enrollmentNumber: string
    email: string
    phone: string
  }
  paymentMethod: string
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded'
  dueDate?: string
  paidDate?: string
  referenceNumber: string
  academicYear?: string
  semester?: number
  createdBy: {
    _id: string
    name: string
    email: string
  }
  updatedBy?: {
    _id: string
    name: string
    email: string
  }
  approvalStatus: 'pending_approval' | 'approved' | 'rejected'
  approvedBy?: {
    _id: string
    name: string
    email: string
  }
  approvedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Student {
  _id: string
  name: string
  enrollmentNumber: string
  email: string
}

export function AdminFinance() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [newTransaction, setNewTransaction] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
    student: '',
    paymentMethod: 'cash',
    status: 'pending' as 'paid' | 'pending' | 'overdue',
    dueDate: '',
    academicYear: '2024-2025',
    semester: 1,
    notes: ''
  })

  const incomeCategories = [
    'tuition_fee', 'lab_fee', 'library_fee', 'examination_fee',
    'admission_fee', 'hostel_fee', 'transport_fee', 'activity_fee',
    'late_fee', 'fine', 'other_income'
  ]

  const expenseCategories = [
    'salary', 'utilities', 'maintenance', 'equipment', 'supplies',
    'rent', 'insurance', 'marketing', 'travel', 'professional_fees',
    'software_licenses', 'training', 'other_expense'
  ]

  useEffect(() => {
    fetchTransactions()
    fetchStudents()
  }, [])

  useEffect(() => {
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.student?.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter)
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, typeFilter, statusFilter, categoryFilter])

  const fetchTransactions = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch('/api/finance/transactions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setTransactions(data.data || [])
      } else {
        setError(data.message || 'Failed to fetch transactions')
      }
    } catch (error) {
      console.error('Finance transactions fetch error:', error)
      setError('Failed to load finance transactions')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch('/api/admin/users?role=student', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        setStudents(data.data || [])
      }
    } catch (error) {
      console.error('Students fetch error:', error)
    }
  }

  const handleCreateTransaction = async () => {
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      
      // Convert amount to paisa (multiply by 100)
      const transactionData = {
        ...newTransaction,
        amount: newTransaction.amount * 100,
        dueDate: newTransaction.dueDate || undefined
      }

      const response = await fetch('/api/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(transactionData),
      })

      const data = await response.json()
      if (data.success) {
        fetchTransactions()
        setIsCreateDialogOpen(false)
        resetNewTransaction()
        alert("Transaction created successfully!")
      } else {
        alert(data.message || "Failed to create transaction")
      }
    } catch (error) {
      console.error('Transaction creation error:', error)
      alert("Failed to create transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTransaction = async () => {
    if (!selectedTransaction) return
    
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/finance/transactions/${selectedTransaction._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: selectedTransaction.description,
          amount: selectedTransaction.amount,
          status: selectedTransaction.status,
          notes: selectedTransaction.notes
        }),
      })

      const data = await response.json()
      if (data.success) {
        fetchTransactions()
        setIsEditDialogOpen(false)
        setSelectedTransaction(null)
        alert("Transaction updated successfully!")
      } else {
        alert(data.message || "Failed to update transaction")
      }
    } catch (error) {
      console.error('Transaction update error:', error)
      alert("Failed to update transaction")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return
    
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/finance/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        fetchTransactions()
        alert("Transaction deleted successfully!")
      } else {
        alert(data.message || "Failed to delete transaction")
      }
    } catch (error) {
      console.error('Transaction deletion error:', error)
      alert("Failed to delete transaction")
    }
  }

  const handleApproveTransaction = async (transactionId: string, approvalStatus: 'approved' | 'rejected', notes?: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/finance/transactions/${transactionId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ approvalStatus, notes }),
      })

      const data = await response.json()
      if (data.success) {
        fetchTransactions()
        alert(`Transaction ${approvalStatus} successfully!`)
      } else {
        alert(data.message || `Failed to ${approvalStatus} transaction`)
      }
    } catch (error) {
      console.error(`Transaction ${approvalStatus} error:`, error)
      alert(`Failed to ${approvalStatus} transaction`)
    }
  }

  const resetNewTransaction = () => {
    setNewTransaction({
      type: 'income',
      category: '',
      amount: 0,
      description: '',
      student: '',
      paymentMethod: 'cash',
      status: 'pending',
      dueDate: '',
      academicYear: '2024-2025',
      semester: 1,
      notes: ''
    })
  }

  // Calculate financial summary from transactions
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) / 100
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 100
  const pendingPayments = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0) / 100
  const overduePayments = transactions.filter(t => t.status === 'overdue').reduce((sum, t) => sum + t.amount, 0) / 100

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    return type === 'income' 
      ? <Badge className="bg-blue-100 text-blue-800">Income</Badge>
      : <Badge className="bg-purple-100 text-purple-800">Expense</Badge>
  }

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading finance data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchTransactions}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
          <p className="text-muted-foreground">Track income, expenses, and payments with role-based access control</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Finance Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Fees, payments, and other income</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Operational and administrative costs</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{transactions.filter(t => t.status === 'pending').length} transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{(totalIncome - totalExpenses).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {totalIncome - totalExpenses > 0 ? "Profit" : "Loss"} this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Finance Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Transactions</CardTitle>
          <CardDescription>
            View and manage all financial transactions. Cashiers can create/edit their own transactions, Admins have full access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...incomeCategories, ...expenseCategories].map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell className="text-sm">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.referenceNumber}
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="text-sm font-medium">
                        {transaction.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{transaction.description}</div>
                        {transaction.student && (
                          <div className="text-xs text-muted-foreground">
                            {transaction.student.name} ({transaction.student.enrollmentNumber})
                          </div>
                        )}
                      </TableCell>
                      <TableCell className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{(transaction.amount / 100).toLocaleString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>{getApprovalBadge(transaction.approvalStatus)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {transaction.approvalStatus === 'pending_approval' && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleApproveTransaction(transaction._id, 'approved')}
                                >
                                  <Check className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleApproveTransaction(transaction._id, 'rejected')}
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteTransaction(transaction._id)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No transactions found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Financial transactions will appear here. Students can submit fee payments, and cashiers/admins can manage all transactions."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Transaction
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerts */}
      {overduePayments > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              Payment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              There are overdue payments totaling ₹{overduePayments.toLocaleString()}. 
              Please follow up with students or vendors immediately.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Create Transaction Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Transaction</DialogTitle>
            <DialogDescription>
              Add a new financial transaction to the system. This will require approval.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Type</Label>
              <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') => setNewTransaction({...newTransaction, type: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">Category</Label>
              <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({...newTransaction, category: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({...newTransaction, amount: parseFloat(e.target.value) || 0})}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Description</Label>
              <Textarea
                id="description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                className="col-span-3"
                placeholder="Enter transaction description"
              />
            </div>
            {newTransaction.type === 'income' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="student" className="text-right">Student</Label>
                <Select value={newTransaction.student} onValueChange={(value) => setNewTransaction({...newTransaction, student: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select student (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No student</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student._id} value={student._id}>
                        {student.name} ({student.enrollmentNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">Payment Method</Label>
              <Select value={newTransaction.paymentMethod} onValueChange={(value) => setNewTransaction({...newTransaction, paymentMethod: value})}>
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="dd">Demand Draft</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">Notes</Label>
              <Textarea
                id="notes"
                value={newTransaction.notes}
                onChange={(e) => setNewTransaction({...newTransaction, notes: e.target.value})}
                className="col-span-3"
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTransaction} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Update transaction information.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedTransaction.description}
                  onChange={(e) => setSelectedTransaction({...selectedTransaction, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-amount" className="text-right">Amount (₹)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={selectedTransaction.amount / 100}
                  onChange={(e) => setSelectedTransaction({...selectedTransaction, amount: (parseFloat(e.target.value) || 0) * 100})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select 
                  value={selectedTransaction.status} 
                  onValueChange={(value: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded') => setSelectedTransaction({...selectedTransaction, status: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={selectedTransaction.notes || ""}
                  onChange={(e) => setSelectedTransaction({...selectedTransaction, notes: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTransaction} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Transaction Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Complete transaction information and audit trail.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Reference Number</Label>
                  <p className="font-mono text-sm">{selectedTransaction.referenceNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedTransaction.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className={`text-sm font-medium ${selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.type === 'income' ? '+' : '-'}₹{(selectedTransaction.amount / 100).toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Approval Status</Label>
                  <div className="mt-1">{getApprovalBadge(selectedTransaction.approvalStatus)}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <p className="text-sm mt-1">{selectedTransaction.description}</p>
              </div>

              {selectedTransaction.student && (
                <div>
                  <Label className="text-sm font-medium">Student</Label>
                  <p className="text-sm mt-1">
                    {selectedTransaction.student.name} ({selectedTransaction.student.enrollmentNumber})
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedTransaction.student.email}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Payment Method</Label>
                  <p className="text-sm">{selectedTransaction.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created By</Label>
                  <p className="text-sm">{selectedTransaction.createdBy.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedTransaction.createdBy.email}</p>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm mt-1">{selectedTransaction.notes}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <Label className="text-xs font-medium">Created At</Label>
                  <p>{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-xs font-medium">Updated At</Label>
                  <p>{new Date(selectedTransaction.updatedAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
