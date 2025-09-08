const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    // College Reference
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College',
      required: true
    },
    
    // Transaction Type
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true
    },
    
    // Category of transaction
    category: {
      type: String,
      required: true,
      enum: [
        // Income categories
        'tuition_fee', 'lab_fee', 'library_fee', 'examination_fee', 
        'admission_fee', 'hostel_fee', 'transport_fee', 'activity_fee',
        'late_fee', 'fine', 'other_income',
        
        // Expense categories
        'salary', 'utilities', 'maintenance', 'equipment', 'supplies',
        'rent', 'insurance', 'marketing', 'travel', 'professional_fees',
        'software_licenses', 'training', 'other_expense'
      ]
    },
    
    // Amount in INR (stored in paisa for precision)
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative']
    },
    
    // Description
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    
    // Student reference (for fee payments)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: function() {
        return this.type === 'income' && this.category.includes('fee');
      }
    },
    
    // Payment method
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'bank_transfer', 'upi', 'cheque', 'dd', 'online'],
      required: true
    },
    
    // Transaction status
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue', 'cancelled', 'refunded'],
      default: 'pending'
    },
    
    // Due date (for fees)
    dueDate: {
      type: Date,
      required: function() {
        return this.type === 'income' && ['pending', 'overdue'].includes(this.status);
      }
    },
    
    // Payment date
    paidDate: {
      type: Date,
      required: function() {
        return this.status === 'paid';
      }
    },
    
    // Reference number (receipt/invoice number)
    referenceNumber: {
      type: String,
      unique: true,
      required: true
    },
    
    // Academic year and semester (for fee payments)
    academicYear: {
      type: String,
      required: function() {
        return this.type === 'income' && this.category.includes('fee');
      }
    },
    
    semester: {
      type: Number,
      min: 1,
      max: 8,
      required: function() {
        return this.type === 'income' && this.category === 'tuition_fee';
      }
    },
    
    // Created by (admin/cashier)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // Last updated by
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    // Approval workflow
    approvalStatus: {
      type: String,
      enum: ['pending_approval', 'approved', 'rejected'],
      default: 'pending_approval'
    },
    
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    approvedAt: {
      type: Date
    },
    
    // Notes/comments
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    
    // Attachments (receipts, invoices)
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
TransactionSchema.index({ college: 1, type: 1, status: 1 });
TransactionSchema.index({ student: 1, academicYear: 1, semester: 1 });
TransactionSchema.index({ referenceNumber: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ dueDate: 1 });

// Virtual for amount in rupees
TransactionSchema.virtual('amountInRupees').get(function() {
  return this.amount / 100;
});

// Virtual for overdue status
TransactionSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'pending' || !this.dueDate) return false;
  return new Date() > this.dueDate;
});

// Pre-save middleware to generate reference number
TransactionSchema.pre('save', async function(next) {
  if (this.isNew && !this.referenceNumber) {
    const prefix = this.type === 'income' ? 'RCP' : 'INV';
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    
    // Find last transaction for this month
    const lastTransaction = await this.constructor.findOne({
      referenceNumber: new RegExp(`^${prefix}${year}${month}`)
    }).sort({ referenceNumber: -1 });
    
    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.referenceNumber.slice(-4));
      sequence = lastSequence + 1;
    }
    
    this.referenceNumber = `${prefix}${year}${month}${sequence.toString().padStart(4, '0')}`;
  }
  
  // Update overdue status
  if (this.status === 'pending' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  next();
});

// Static method to get financial summary
TransactionSchema.statics.getFinancialSummary = async function(collegeId, filters = {}) {
  const match = { college: collegeId, ...filters };
  
  const pipeline = [
    { $match: match },
    {
      $group: {
        _id: '$type',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        paid: {
          $sum: {
            $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0]
          }
        },
        pending: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0]
          }
        },
        overdue: {
          $sum: {
            $cond: [{ $eq: ['$status', 'overdue'] }, '$amount', 0]
          }
        }
      }
    }
  ];
  
  return await this.aggregate(pipeline);
};

// Static method to get student fee status
TransactionSchema.statics.getStudentFeeStatus = async function(studentId, academicYear) {
  return await this.find({
    student: studentId,
    academicYear: academicYear,
    type: 'income'
  }).populate('student', 'name enrollmentNumber');
};

module.exports = mongoose.model('Transaction', TransactionSchema);
