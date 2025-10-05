"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Receipt } from "@/components/payment/receipt";
import { downloadReceipt } from "@/components/payment/receipt";
import { getCurrentUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { 
  FileText, 
  Download, 
  Search, 
  Calendar,
  CreditCard,
  Eye,
  Filter
} from "lucide-react";
import { format } from "date-fns";

interface ReceiptItem {
  id: string;
  receiptNumber: string;
  transactionId: string;
  amount: number;
  category: string;
  paymentDate: string;
  paymentMethod: string;
  semester: number;
  academicYear: string;
}

interface ReceiptData {
  transactionId: string;
  feeType: string;
  amount: number;
  paymentDate: string;
  semester: string;
  studentName: string;
  studentId: string;
  rollNumber: string;
  enrollmentNumber: string;
  department: string;
  paymentMethod: string;
  dueDate: string;
  academicYear: string;
}

export default function StudentReceipts() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'student') {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }
    setUser(currentUser);
    fetchReceipts();
  }, [router, page]);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/student-services/receipts?page=${page}&limit=10`);
      
      if (response.data.success) {
        setReceipts(response.data.data);
        setTotalPages(response.data.totalPages);
      }
    } catch (error: any) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceiptDetails = async (transactionId: string) => {
    try {
      const response = await api.get(`/api/student-services/receipt/${transactionId}`);
      
      if (response.data.success) {
        setSelectedReceipt(response.data.data);
        setShowReceiptModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching receipt details:', error);
      alert('Failed to load receipt details');
    }
  };

  const handleDownloadReceipt = (receipt: ReceiptItem) => {
    const receiptData: ReceiptData = {
      transactionId: receipt.transactionId,
      feeType: receipt.category.replace('_', ' '),
      amount: receipt.amount,
      paymentDate: receipt.paymentDate,
      semester: `Semester ${receipt.semester}`,
      studentName: user?.name || '',
      studentId: receipt.id.slice(0, 8).toUpperCase(),
      rollNumber: user?.rollNumber || '',
      enrollmentNumber: user?.enrollmentNumber || '',
      department: user?.department || 'N/A',
      paymentMethod: receipt.paymentMethod,
      dueDate: receipt.paymentDate,
      academicYear: receipt.academicYear
    };
    
    downloadReceipt(receiptData);
  };

  const filteredReceipts = receipts.filter(receipt =>
    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && receipts.length === 0) {
    return (
      <DashboardLayout title="Payment Receipts" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading receipts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Payment Receipts" userRole="student">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Payment Receipts</h1>
            <p className="text-muted-foreground">View and download your fee payment receipts</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search receipts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Receipts List */}
        <div className="grid gap-4">
          {filteredReceipts.length > 0 ? (
            filteredReceipts.map((receipt) => (
              <Card key={receipt.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <FileText className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{receipt.receiptNumber}</h3>
                        <p className="text-sm text-gray-600">
                          Transaction ID: {receipt.transactionId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {receipt.category.replace('_', ' ').charAt(0).toUpperCase() + 
                           receipt.category.replace('_', ' ').slice(1)} Fee
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {format(new Date(receipt.paymentDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{receipt.paymentMethod}</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{receipt.amount.toLocaleString()}
                      </p>
                      <Badge className="mt-1 bg-green-100 text-green-800">
                        Paid
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchReceiptDetails(receipt.transactionId)}
                      className="flex items-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Receipt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadReceipt(receipt)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payment receipts found</p>
                  <p className="text-sm">Make a payment to generate receipts</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="flex items-center px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Official receipt for your fee payment
            </DialogDescription>
          </DialogHeader>
          
          {selectedReceipt && (
            <div className="mt-4">
              <Receipt data={selectedReceipt} />
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => downloadReceipt(selectedReceipt)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
