// Mock data for the ERP system demo

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  department: string;
  semester: number;
  admissionDate: string;
  phoneNumber: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  semester: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'tuition' | 'hostel' | 'exam' | 'library';
  transactionId?: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  building: string;
  capacity: number;
  occupied: number;
  type: 'single' | 'double' | 'triple';
  amenities: string[];
}

export interface HostelAllocation {
  id: string;
  studentId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate?: string;
  status: 'active' | 'requested' | 'expired';
}

export interface ExamRecord {
  id: string;
  studentId: string;
  subject: string;
  examType: 'mid-term' | 'final' | 'assignment' | 'quiz';
  maxMarks: number;
  obtainedMarks?: number;
  examDate: string;
  status: 'scheduled' | 'completed' | 'graded';
}

// Mock student data
export const mockStudent: Student = {
  id: '1',
  name: 'Priya Sharma',
  email: 'student@yukti.edu',
  rollNumber: 'CS21B001',
  department: 'Computer Science',
  semester: 6,
  admissionDate: '2021-08-15',
  phoneNumber: '+91 9876543210',
  address: '123 Main Street, Mumbai, Maharashtra 400001',
  guardianName: 'Mr. Raj Sharma',
  guardianPhone: '+91 9876543211',
};

// Mock fee records
export const mockFeeRecords: FeeRecord[] = [
  {
    id: '1',
    studentId: '1',
    semester: 'Semester 6',
    amount: 45000,
    dueDate: '2024-01-15',
    paidDate: '2024-01-10',
    status: 'paid',
    type: 'tuition',
    transactionId: 'TXN1704870210456',
  },
  {
    id: '2',
    studentId: '1',
    semester: 'Semester 6',
    amount: 15000,
    dueDate: '2024-01-15',
    paidDate: '2024-01-12',
    status: 'paid',
    type: 'hostel',
    transactionId: 'TXN1705043612789',
  },
  {
    id: '3',
    studentId: '1',
    semester: 'Semester 7',
    amount: 45000,
    dueDate: '2024-07-15',
    status: 'pending',
    type: 'tuition',
  },
  {
    id: '4',
    studentId: '1',
    semester: 'Semester 7',
    amount: 2000,
    dueDate: '2024-06-30',
    status: 'pending',
    type: 'exam',
  },
];

// Mock hostel data
export const mockHostelRooms: HostelRoom[] = [
  {
    id: '1',
    roomNumber: '101',
    building: 'Block A',
    capacity: 2,
    occupied: 2,
    type: 'double',
    amenities: ['WiFi', 'Study Table', 'Wardrobe', 'Fan'],
  },
  {
    id: '2',
    roomNumber: '205',
    building: 'Block B',
    capacity: 3,
    occupied: 2,
    type: 'triple',
    amenities: ['WiFi', 'Study Table', 'Wardrobe', 'AC'],
  },
];

export const mockHostelAllocation: HostelAllocation = {
  id: '1',
  studentId: '1',
  roomId: '1',
  checkInDate: '2023-08-01',
  status: 'active',
};

// Mock exam records
export const mockExamRecords: ExamRecord[] = [
  {
    id: '1',
    studentId: '1',
    subject: 'Data Structures',
    examType: 'mid-term',
    maxMarks: 100,
    obtainedMarks: 85,
    examDate: '2024-03-15',
    status: 'graded',
  },
  {
    id: '2',
    studentId: '1',
    subject: 'Database Systems',
    examType: 'mid-term',
    maxMarks: 100,
    obtainedMarks: 92,
    examDate: '2024-03-18',
    status: 'graded',
  },
  {
    id: '3',
    studentId: '1',
    subject: 'Computer Networks',
    examType: 'final',
    maxMarks: 100,
    examDate: '2024-05-20',
    status: 'scheduled',
  },
  {
    id: '4',
    studentId: '1',
    subject: 'Software Engineering',
    examType: 'final',
    maxMarks: 100,
    examDate: '2024-05-25',
    status: 'scheduled',
  },
];

// Analytics data for dashboards
export const mockAnalytics = {
  student: {
    currentSemester: 6,
    cgpa: 8.7,
    attendance: 87,
    creditsCompleted: 140,
    totalCredits: 180,
  },
  staff: {
    totalStudents: 245,
    pendingAdmissions: 12,
    feeCollectionRate: 89,
    hostelOccupancy: 78,
  },
  admin: {
    totalStudents: 1250,
    totalFaculty: 85,
    revenue: 2850000,
    pendingFees: 340000,
    hostelOccupancy: 92,
    examScheduled: 45,
  },
};
