"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReceiptData {
  transactionId: string;
  feeType: string;
  amount: number;
  paymentDate: string;
  semester: string;
  studentName: string;
  studentId: string;
  rollNumber: string;
  department: string;
  paymentMethod: string;
  dueDate: string;
  academicYear: string;
}

interface ReceiptProps {
  data: ReceiptData;
}

export function Receipt({ data }: ReceiptProps) {
  return (
    <div className="bg-white p-8 max-w-2xl mx-auto" id="payment-receipt">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">OnchainERP College</h1>
        <p className="text-gray-600">Fee Payment Receipt</p>
      </div>

      {/* Receipt Info */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Receipt Details</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Receipt No:</span> RCP{data.transactionId}</p>
            <p><span className="font-medium">Transaction ID:</span> {data.transactionId}</p>
            <p><span className="font-medium">Payment Date:</span> {format(new Date(data.paymentDate), 'dd/MM/yyyy')}</p>
            <p><span className="font-medium">Payment Method:</span> {data.paymentMethod}</p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Student Details</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {data.studentName}</p>
            <p><span className="font-medium">Student ID:</span> {data.studentId}</p>
            <p><span className="font-medium">Roll Number:</span> {data.rollNumber}</p>
            <p><span className="font-medium">Department:</span> {data.department}</p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Fee Details */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Fee Details</h3>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Description</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Semester</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-900">Due Date</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-900">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="px-4 py-2 text-sm">{data.feeType.charAt(0).toUpperCase() + data.feeType.slice(1)} Fee</td>
                <td className="px-4 py-2 text-sm">{data.semester}</td>
                <td className="px-4 py-2 text-sm">{format(new Date(data.dueDate), 'dd/MM/yyyy')}</td>
                <td className="px-4 py-2 text-sm text-right font-medium">₹{data.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Payment Summary */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm">Subtotal</span>
          <span className="text-sm">₹{data.amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Processing Fee</span>
          <span className="text-sm">₹0</span>
        </div>
        <Separator />
        <div className="flex justify-between items-center font-semibold text-lg">
          <span>Total Paid</span>
          <span>₹{data.amount.toLocaleString()}</span>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mt-6 text-center">
        <Badge className="bg-green-100 text-green-800 px-4 py-2">
          Payment Successful
        </Badge>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p>For any queries, please contact the accounts department.</p>
          <p>Generated on: {format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
        </div>
      </div>
    </div>
  );
}

// Function to generate and download receipt as PDF
export const downloadReceipt = (receiptData: ReceiptData) => {
  // Create a new window with the receipt content
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fee Payment Receipt - ${receiptData.transactionId}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .header { text-center; margin-bottom: 40px; }
        .header h1 { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .header p { color: #666; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
        .section h3 { font-weight: 600; margin-bottom: 16px; }
        .section p { margin-bottom: 4px; font-size: 14px; }
        .section .label { font-weight: 500; }
        .separator { border: none; height: 1px; background: #e5e7eb; margin: 30px 0; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table th, .table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid #e5e7eb; }
        .table th { background: #f9fafb; font-weight: 500; }
        .table .amount { text-align: right; font-weight: 500; }
        .summary { margin-top: 20px; }
        .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .total { font-weight: 600; font-size: 18px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
        .status { text-align: center; margin: 30px 0; }
        .badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 6px; font-weight: 500; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #666; }
        .footer p { margin-bottom: 4px; }
        @media print {
          .container { padding: 20px; }
          .header, .section, .table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>OnchainERP College</h1>
          <p>Fee Payment Receipt</p>
        </div>

        <div class="grid">
          <div class="section">
            <h3>Receipt Details</h3>
            <p><span class="label">Receipt No:</span> RCP${receiptData.transactionId}</p>
            <p><span class="label">Transaction ID:</span> ${receiptData.transactionId}</p>
            <p><span class="label">Payment Date:</span> ${format(new Date(receiptData.paymentDate), 'dd/MM/yyyy')}</p>
            <p><span class="label">Payment Method:</span> ${receiptData.paymentMethod}</p>
          </div>
          <div class="section">
            <h3>Student Details</h3>
            <p><span class="label">Name:</span> ${receiptData.studentName}</p>
            <p><span class="label">Student ID:</span> ${receiptData.studentId}</p>
            <p><span class="label">Roll Number:</span> ${receiptData.rollNumber}</p>
            <p><span class="label">Department:</span> ${receiptData.department}</p>
          </div>
        </div>

        <hr class="separator">

        <div class="section">
          <h3>Fee Details</h3>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Semester</th>
                <th>Due Date</th>
                <th class="amount">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${receiptData.feeType.charAt(0).toUpperCase() + receiptData.feeType.slice(1)} Fee</td>
                <td>${receiptData.semester}</td>
                <td>${format(new Date(receiptData.dueDate), 'dd/MM/yyyy')}</td>
                <td class="amount">₹${receiptData.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <hr class="separator">

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>₹${receiptData.amount.toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>Processing Fee</span>
            <span>₹0</span>
          </div>
          <div class="summary-row total">
            <span>Total Paid</span>
            <span>₹${receiptData.amount.toLocaleString()}</span>
          </div>
        </div>

        <div class="status">
          <span class="badge">Payment Successful</span>
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p>For any queries, please contact the accounts department.</p>
          <p>Generated on: ${format(new Date(), 'dd/MM/yyyy hh:mm a')}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(receiptHtml);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};
