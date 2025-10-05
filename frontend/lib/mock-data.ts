// Mock data for the ERP system demo

export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  enrollmentNumber: string;
  department: string;
  section: string;
  semester: number;
  admissionDate: string;
  phoneNumber: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  cgpa: number;
  profilePicture?: string;
  currentSemester: number;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  semester: string;
  category: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  type: 'tuition' | 'hostel' | 'exam' | 'library';
  transactionId?: string;
}

export interface FeeSummary {
  totalFees: number;
  paidAmount: number;
  remainingAmount: number;
  feeStatus: 'Paid' | 'Partial' | 'Unpaid';
}

export interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  progress: number;
  grade: string;
  schedule: string;
  room: string;
  students: number;
}

export interface Assignment {
  id: string;
  title: string;
  course: string;
  courseCode: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  description: string;
  totalMarks: number;
  obtainedMarks?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'academic' | 'fees' | 'exam' | 'general' | 'fee' | 'event' | 'alert';
  date: string;
  read: boolean;
  isRead: boolean;
  createdAt: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
}

// Attendance related interfaces
export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  attendanceDate: string;
  period: number;
  status: 'present' | 'absent' | 'late' | 'excused';
  topic?: string;
  classType: 'lecture' | 'practical' | 'tutorial';
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
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export interface OverallStats {
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  overallPercentage: number;
}

export interface AttendanceData {
  student: {
    id: string;
    name: string;
    rollNumber: string;
    section: {
      name: string;
      semester: number;
    };
  };
  overallStats: OverallStats;
  subjectWiseStats: SubjectStats[];
  attendanceRecords: AttendanceRecord[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface DashboardData {
  student: {
    id: string;
    name: string;
    email: string;
    rollNumber: string;
    enrollmentNumber: string;
    department: string;
    section: string;
    currentSemester: number;
    cgpa: number;
  };
  analytics: {
    attendance: number;
    cgpa: number;
    enrolledCourses: number;
    currentSemester: number;
    creditsCompleted: number;
    totalCredits: number;
  };
  pendingFees: {
    count: number;
    totalAmount: number;
    fees: FeeRecord[];
  };
  upcomingExams: ExamRecord[];
  notifications: Notification[];
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
  enrollmentNumber: 'EN2021CS001',
  department: 'Computer Science & Engineering',
  section: 'CS-A',
  semester: 6,
  currentSemester: 6,
  cgpa: 8.75,
  admissionDate: '2021-08-15',
  phoneNumber: '+91 9876543210',
  address: '123 Main Street, Mumbai, Maharashtra 400001',
  guardianName: 'Mr. Raj Sharma',
  guardianPhone: '+91 9876543211',
};

// Mock courses data
export const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CS301',
    name: 'Data Structures & Algorithms',
    instructor: 'Dr. Sarah Johnson',
    credits: 4,
    progress: 85,
    grade: 'A',
    schedule: 'MWF 9:00-10:00 AM',
    room: 'CS-201',
    students: 45,
  },
  {
    id: '2',
    code: 'CS302',
    name: 'Database Management Systems',
    instructor: 'Prof. Michael Chen',
    credits: 3,
    progress: 78,
    grade: 'A-',
    schedule: 'TTh 11:00-12:30 PM',
    room: 'CS-205',
    students: 40,
  },
  {
    id: '3',
    code: 'CS303',
    name: 'Computer Networks',
    instructor: 'Dr. Emily Rodriguez',
    credits: 3,
    progress: 92,
    grade: 'A+',
    schedule: 'MWF 2:00-3:00 PM',
    room: 'CS-301',
    students: 38,
  },
  {
    id: '4',
    code: 'CS304',
    name: 'Operating Systems',
    instructor: 'Dr. Robert Kim',
    credits: 4,
    progress: 70,
    grade: 'B+',
    schedule: 'TTh 9:30-11:00 AM',
    room: 'CS-150',
    students: 42,
  },
  {
    id: '5',
    code: 'CS305',
    name: 'Software Engineering',
    instructor: 'Prof. Lisa Wang',
    credits: 3,
    progress: 88,
    grade: 'A',
    schedule: 'MWF 1:00-2:00 PM',
    room: 'CS-210',
    students: 35,
  },
];

// Mock assignments
export const mockAssignments: Assignment[] = [
  {
    id: '1',
    title: 'Binary Search Tree Implementation',
    course: 'Data Structures & Algorithms',
    courseCode: 'CS301',
    dueDate: '2024-01-25',
    status: 'pending',
    description: 'Implement a complete BST with insertion, deletion, and traversal operations',
    totalMarks: 100,
  },
  {
    id: '2',
    title: 'Database Design Project',
    course: 'Database Management Systems',
    courseCode: 'CS302',
    dueDate: '2024-01-28',
    status: 'submitted',
    description: 'Design a complete database schema for a library management system',
    totalMarks: 100,
    obtainedMarks: 92,
  },
  {
    id: '3',
    title: 'Socket Programming Lab',
    course: 'Computer Networks',
    courseCode: 'CS303',
    dueDate: '2024-02-02',
    status: 'pending',
    description: 'Create a client-server application using TCP sockets',
    totalMarks: 50,
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Assignment Deadline Reminder',
    message: 'Your BST Implementation assignment is due in 3 days. Please submit before the deadline to avoid penalty.',
    type: 'academic',
    date: '2024-01-22',
    read: false,
    isRead: false,
    createdAt: '2024-01-22T10:30:00Z',
    category: 'Academic',
    priority: 'high',
    actionRequired: true,
  },
  {
    id: '2',
    title: 'Fee Payment Confirmation',
    message: 'Your semester fee payment of ₹45,000 has been successfully processed. Receipt has been sent to your email.',
    type: 'fee',
    date: '2024-01-20',
    read: true,
    isRead: true,
    createdAt: '2024-01-20T14:15:00Z',
    category: 'Finance',
    priority: 'low',
    actionRequired: false,
  },
  {
    id: '3',
    title: 'Mid-Semester Exam Schedule Released',
    message: 'The mid-semester examination schedule has been published. Please check your exam dates and venues.',
    type: 'exam',
    date: '2024-01-18',
    read: false,
    isRead: false,
    createdAt: '2024-01-18T09:00:00Z',
    category: 'Examinations',
    priority: 'medium',
    actionRequired: true,
  },
  {
    id: '4',
    title: 'Library Book Due Tomorrow',
    message: 'Please return "Introduction to Algorithms" by Thomas Cormen tomorrow to avoid late fees.',
    type: 'general',
    date: '2024-01-21',
    read: false,
    isRead: false,
    createdAt: '2024-01-21T16:45:00Z',
    category: 'Library',
    priority: 'medium',
    actionRequired: true,
  },
  {
    id: '5',
    title: 'Hostel Room Allocation Update',
    message: 'Your hostel room allocation for next semester has been confirmed. Room: A-101, Block A.',
    type: 'general',
    date: '2024-01-19',
    read: true,
    isRead: true,
    createdAt: '2024-01-19T11:20:00Z',
    category: 'Hostel',
    priority: 'low',
    actionRequired: false,
  },
  {
    id: '6',
    title: 'Workshop Registration Open',
    message: 'Registration is now open for the "Machine Learning Fundamentals" workshop scheduled for next week.',
    type: 'event',
    date: '2024-01-17',
    read: false,
    isRead: false,
    createdAt: '2024-01-17T13:30:00Z',
    category: 'Events',
    priority: 'low',
    actionRequired: false,
  },
  {
    id: '7',
    title: 'Attendance Warning',
    message: 'Your attendance in Computer Networks (CS303) has dropped below 75%. Please attend classes regularly.',
    type: 'alert',
    date: '2024-01-16',
    read: false,
    isRead: false,
    createdAt: '2024-01-16T08:15:00Z',
    category: 'Academic',
    priority: 'high',
    actionRequired: true,
  },
  {
    id: '8',
    title: 'New Course Material Available',
    message: 'New lecture notes and assignments for Database Management Systems have been uploaded to the portal.',
    type: 'academic',
    date: '2024-01-15',
    read: true,
    isRead: true,
    createdAt: '2024-01-15T15:45:00Z',
    category: 'Academic',
    priority: 'low',
    actionRequired: false,
  },
];

// Mock fee records
export const mockFeeRecords: FeeRecord[] = [
  {
    id: '1',
    studentId: '1',
    semester: 'Semester 6',
    category: 'Tuition Fee',
    amount: '45000',
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
    category: 'Hostel Fee',
    amount: '15000',
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
    category: 'Tuition Fee',
    amount: '47000',
    dueDate: '2024-07-15',
    status: 'pending',
    type: 'tuition',
  },
  {
    id: '4',
    studentId: '1',
    semester: 'Semester 7',
    category: 'Exam Fee',
    amount: '2500',
    dueDate: '2024-06-30',
    status: 'pending',
    type: 'exam',
  },
];

// Mock fee summary
export const mockFeeSummary: FeeSummary = {
  totalFees: 109500,
  paidAmount: 60000,
  remainingAmount: 49500,
  feeStatus: 'Partial',
};

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
    subject: 'Data Structures & Algorithms',
    examType: 'mid-term',
    maxMarks: 100,
    obtainedMarks: 85,
    examDate: '2024-02-15',
    status: 'graded',
  },
  {
    id: '2',
    studentId: '1',
    subject: 'Database Management Systems',
    examType: 'mid-term',
    maxMarks: 100,
    obtainedMarks: 92,
    examDate: '2024-02-18',
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
    subject: 'Operating Systems',
    examType: 'final',
    maxMarks: 100,
    examDate: '2024-05-22',
    status: 'scheduled',
  },
  {
    id: '5',
    studentId: '1',
    subject: 'Software Engineering',
    examType: 'final',
    maxMarks: 100,
    examDate: '2024-05-25',
    status: 'scheduled',
  },
];

// Complete dashboard data
export const mockDashboardData: DashboardData = {
  student: {
    id: '1',
    name: 'Priya Sharma',
    email: 'student@yukti.edu',
    rollNumber: 'CS21B001',
    enrollmentNumber: 'EN2021CS001',
    department: 'Computer Science & Engineering',
    section: 'CS-A',
    currentSemester: 6,
    cgpa: 8.75,
  },
  analytics: {
    attendance: 87.5,
    cgpa: 8.75,
    enrolledCourses: 5,
    currentSemester: 6,
    creditsCompleted: 140,
    totalCredits: 180,
  },
  pendingFees: {
    count: 2,
    totalAmount: 49500,
    fees: mockFeeRecords.filter(fee => fee.status === 'pending'),
  },
  upcomingExams: mockExamRecords.filter(exam => exam.status === 'scheduled'),
  notifications: mockNotifications,
};

// Mock today's schedule
export const mockTodaySchedule = [
  {
    time: '9:00 AM',
    course: 'Data Structures & Algorithms',
    room: 'CS-201',
    type: 'Lecture',
    instructor: 'Dr. Sarah Johnson',
  },
  {
    time: '11:00 AM',
    course: 'Database Management Systems',
    room: 'CS-205',
    type: 'Lab',
    instructor: 'Prof. Michael Chen',
  },
  {
    time: '2:00 PM',
    course: 'Computer Networks',
    room: 'CS-301',
    type: 'Tutorial',
    instructor: 'Dr. Emily Rodriguez',
  },
];

// Mock recent grades
export const mockRecentGrades = [
  {
    course: 'Data Structures & Algorithms',
    assignment: 'Mid-term Exam',
    grade: 'A',
    points: '85/100',
    date: '2024-02-15',
  },
  {
    course: 'Database Management Systems',
    assignment: 'Project Submission',
    grade: 'A+',
    points: '92/100',
    date: '2024-02-12',
  },
  {
    course: 'Computer Networks',
    assignment: 'Lab Assignment 3',
    grade: 'A-',
    points: '88/100',
    date: '2024-02-10',
  },
  {
    course: 'Operating Systems',
    assignment: 'Quiz 2',
    grade: 'B+',
    points: '78/100',
    date: '2024-02-08',
  },
];

// Analytics data for dashboards
export const mockAnalytics = {
  student: {
    currentSemester: 6,
    cgpa: 8.75,
    attendance: 87.5,
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

// Mock library data
export const mockLibraryData = {
  borrowedBooks: [
    {
      id: '1',
      title: 'Introduction to Algorithms',
      author: 'Thomas H. Cormen',
      isbn: '9780262033848',
      borrowDate: '2024-01-15',
      dueDate: '2024-01-29',
      status: 'borrowed',
    },
    {
      id: '2',
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      isbn: '9780073523323',
      borrowDate: '2024-01-20',
      dueDate: '2024-02-03',
      status: 'borrowed',
    },
  ],
  fines: 0,
  reservedBooks: 1,
};

// Mock hostel data for student
export const mockStudentHostel = {
  roomDetails: {
    roomNumber: 'A-101',
    building: 'Block A',
    floor: 1,
    type: 'Double Sharing',
    roommates: ['Anjali Patel'],
  },
  facilities: ['WiFi', 'Study Table', 'Wardrobe', 'Fan', 'Attached Bathroom'],
  warden: {
    name: 'Mrs. Sunita Devi',
    phone: '+91 9876543222',
    email: 'warden.blocka@yukti.edu',
  },
  checkInDate: '2023-08-01',
  monthlyFee: 15000,
  status: 'active',
};

// Mock attendance data
export const mockAttendanceData: AttendanceData = {
  student: {
    id: '1',
    name: 'Priya Sharma',
    rollNumber: 'CS21B001',
    section: {
      name: 'CS-A',
      semester: 6,
    },
  },
  overallStats: {
    totalClasses: 180,
    present: 158,
    absent: 15,
    late: 5,
    excused: 2,
    overallPercentage: 87.8,
  },
  subjectWiseStats: [
    {
      courseId: '1',
      courseCode: 'CS301',
      courseName: 'Data Structures and Algorithms',
      totalClasses: 45,
      present: 42,
      absent: 2,
      late: 1,
      excused: 0,
      percentage: 93.3,
    },
    {
      courseId: '2',
      courseCode: 'CS302',
      courseName: 'Database Management Systems',
      totalClasses: 40,
      present: 35,
      absent: 3,
      late: 2,
      excused: 0,
      percentage: 87.5,
    },
    {
      courseId: '3',
      courseCode: 'CS303',
      courseName: 'Computer Networks',
      totalClasses: 38,
      present: 30,
      absent: 6,
      late: 1,
      excused: 1,
      percentage: 78.9,
    },
    {
      courseId: '4',
      courseCode: 'CS304',
      courseName: 'Software Engineering',
      totalClasses: 35,
      present: 32,
      absent: 2,
      late: 1,
      excused: 0,
      percentage: 91.4,
    },
    {
      courseId: '5',
      courseCode: 'CS305',
      courseName: 'Operating Systems',
      totalClasses: 22,
      present: 19,
      absent: 2,
      late: 0,
      excused: 1,
      percentage: 86.4,
    },
  ],
  attendanceRecords: [
    {
      id: '1',
      studentId: '1',
      courseId: '1',
      attendanceDate: '2024-01-15',
      period: 1,
      status: 'present',
      topic: 'Introduction to Arrays and Linked Lists',
      classType: 'lecture',
      course: {
        id: '1',
        code: 'CS301',
        name: 'Data Structures and Algorithms',
      },
    },
    {
      id: '2',
      studentId: '1',
      courseId: '2',
      attendanceDate: '2024-01-15',
      period: 2,
      status: 'present',
      topic: 'SQL Basics and Queries',
      classType: 'practical',
      course: {
        id: '2',
        code: 'CS302',
        name: 'Database Management Systems',
      },
    },
    {
      id: '3',
      studentId: '1',
      courseId: '3',
      attendanceDate: '2024-01-16',
      period: 1,
      status: 'absent',
      topic: 'OSI Model and TCP/IP',
      classType: 'lecture',
      course: {
        id: '3',
        code: 'CS303',
        name: 'Computer Networks',
      },
    },
    {
      id: '4',
      studentId: '1',
      courseId: '4',
      attendanceDate: '2024-01-16',
      period: 3,
      status: 'present',
      topic: 'Software Development Life Cycle',
      classType: 'tutorial',
      course: {
        id: '4',
        code: 'CS304',
        name: 'Software Engineering',
      },
    },
    {
      id: '5',
      studentId: '1',
      courseId: '5',
      attendanceDate: '2024-01-17',
      period: 2,
      status: 'late',
      topic: 'Process Management',
      classType: 'lecture',
      course: {
        id: '5',
        code: 'CS305',
        name: 'Operating Systems',
      },
    },
    {
      id: '6',
      studentId: '1',
      courseId: '1',
      attendanceDate: '2024-01-17',
      period: 4,
      status: 'present',
      topic: 'Stack and Queue Implementation',
      classType: 'practical',
      course: {
        id: '1',
        code: 'CS301',
        name: 'Data Structures and Algorithms',
      },
    },
    {
      id: '7',
      studentId: '1',
      courseId: '2',
      attendanceDate: '2024-01-18',
      period: 1,
      status: 'present',
      topic: 'Normalization and ER Diagrams',
      classType: 'lecture',
      course: {
        id: '2',
        code: 'CS302',
        name: 'Database Management Systems',
      },
    },
    {
      id: '8',
      studentId: '1',
      courseId: '3',
      attendanceDate: '2024-01-18',
      period: 3,
      status: 'excused',
      topic: 'Network Security Fundamentals',
      classType: 'lecture',
      course: {
        id: '3',
        code: 'CS303',
        name: 'Computer Networks',
      },
    },
    {
      id: '9',
      studentId: '1',
      courseId: '4',
      attendanceDate: '2024-01-19',
      period: 2,
      status: 'present',
      topic: 'Agile Methodology',
      classType: 'tutorial',
      course: {
        id: '4',
        code: 'CS304',
        name: 'Software Engineering',
      },
    },
    {
      id: '10',
      studentId: '1',
      courseId: '5',
      attendanceDate: '2024-01-19',
      period: 4,
      status: 'present',
      topic: 'Memory Management Techniques',
      classType: 'lecture',
      course: {
        id: '5',
        code: 'CS305',
        name: 'Operating Systems',
      },
    },
  ],
};
