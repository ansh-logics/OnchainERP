// TypeScript interfaces for Student API responses

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  shortName?: string;
}

export interface Section {
  id: string;
  name: string;
  code: string;
  semester: number;
  batch: string;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  logo?: string;
}

export interface StudentProfile {
  id: string;
  rollNumber: string;
  enrollmentNumber: string;
  currentSemester: number;
  batch: string;
  program: string;
  cgpa?: number;
  dateOfBirth?: string;
  gender?: string;
  personalEmail?: string;
  personalPhone?: string;
  permanentAddressStreet?: string;
  permanentAddressCity?: string;
  permanentAddressState?: string;
  permanentAddressPincode?: string;
  currentAddressStreet?: string;
  currentAddressCity?: string;
  currentAddressState?: string;
  currentAddressPincode?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  admissionStatus: string;
  user: User;
  department: Department;
  section: Section;
  college: College;
}

export interface AttendanceRecord {
  id: string;
  attendanceDate: string;
  period: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  topic?: string;
  classType: string;
  markedAt: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
}

export interface SubjectStats {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical';
}

export interface AttendanceData {
  student: {
    id: string;
    name: string;
    rollNumber: string;
    enrollmentNumber: string;
    section: {
      name: string;
      code: string;
      semester: number;
    };
  };
  overallStats: {
    totalClasses: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    overallPercentage: number;
  };
  subjectWiseStats: SubjectStats[];
  attendanceRecords: AttendanceRecord[];
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  section: {
    id: string;
    name: string;
    code: string;
    batch: string;
  };
  faculty: {
    id: string;
    employeeId: string;
    user: {
      name: string;
    };
  };
  assignmentType: string;
  maxMarks: number;
  assignedDate: string;
  dueDate: string;
  submissionFormat: string[];
  isOverdue: boolean;
  submission?: {
    id: string;
    submissionDate: string;
    isLateSubmission: boolean;
    submissionText?: string;
    fileUrls: string[];
    marksObtained?: number;
    feedback?: string;
    gradedAt?: string;
    grader?: {
      id: string;
      user: {
        name: string;
      };
    };
  };
}

export interface AssignmentStats {
  totalAssignments: number;
  submittedCount: number;
  gradedCount: number;
  pendingGrading: number;
  pendingAssignments: number;
  overdueAssignments: number;
  averageScore: number;
  submissionRate: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  feeType: string;
  type?: string; // For backward compatibility
  category?: string; // For backward compatibility
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount: number;
  paidDate?: string;
  balance: number;
  semester: number;
  academicYear: string;
  createdAt: string;
  transactionId?: string;
  description?: string;
}

export interface FeeSummary {
  totalAmount: number;
  totalFees?: number; // For backward compatibility
  paidAmount: number;
  pendingAmount: number;
  remainingAmount?: number; // For backward compatibility
  overdueAmount: number;
  nextDueDate?: string;
  lastPaymentDate?: string;
  semester: number;
  academicYear: string;
  feeStatus?: 'Paid' | 'Partial' | 'Unpaid';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'academic' | 'admin' | 'exam' | 'fee' | 'event' | 'alert';
  priority: 'high' | 'medium' | 'low';
  isRead: boolean;
  createdAt: string;
  category: string;
  actionRequired?: boolean;
  data?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
