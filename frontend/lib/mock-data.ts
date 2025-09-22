// Mock data for ERP system demonstration
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin' | 'staff';
  avatar?: string;
  phone?: string;
  department?: string;
  college?: College;
  profile?: StudentProfile | FacultyProfile;
}

export interface College {
  id: string;
  name: string;
  shortName: string;
  establishedYear: number;
  affiliatedUniversity: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  contactDetails: {
    phone: string;
    email: string;
    website: string;
  };
}

export interface StudentProfile {
  studentId: string;
  rollNumber: string;
  admissionYear: number;
  program: string;
  batch: string;
  semester: number;
  status: 'active' | 'graduated' | 'suspended' | 'dropped';
  admissionStatus: 'pending' | 'approved' | 'rejected' | 'documents_required';
  hostelDetails?: {
    roomNumber?: string;
    blockName?: string;
    allocated: boolean;
  };
}

export interface FacultyProfile {
  employeeId: string;
  designation: string;
  qualification: string;
  experience: number;
  specialization: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  department: string;
  semester: number;
  description: string;
  faculty?: User;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  head: User;
  establishedYear: number;
  description: string;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  type: 'tuition' | 'hostel' | 'library' | 'lab' | 'exam' | 'other';
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paidAmount?: number;
  paidDate?: string;
  receipt?: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  blockName: string;
  capacity: number;
  occupied: number;
  type: 'single' | 'double' | 'triple' | 'quad';
  facilities: string[];
  rent: number;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  location: string;
}

export interface BookIssue {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fine?: number;
  status: 'issued' | 'returned' | 'overdue';
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  semester: number;
  marks: number;
  totalMarks: number;
  grade: string;
  credits: number;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  period?: number;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'academic' | 'admission' | 'exam' | 'fee' | 'urgent';
  publishedDate: string;
  expiryDate?: string;
  targetAudience: ('student' | 'faculty' | 'staff' | 'all')[];
  attachments?: string[];
}

export interface Application {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  program: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'documents_required';
  submittedDate?: string;
  documents: {
    type: string;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    url?: string;
  }[];
  reviewNotes?: string;
}

// Mock Data
export const mockColleges: College[] = [
  {
    id: '1',
    name: 'ABC College of Engineering',
    shortName: 'ABC',
    establishedYear: 1995,
    affiliatedUniversity: 'XYZ University',
    address: {
      street: '123 Education Street',
      city: 'Tech City',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    contactDetails: {
      phone: '+91-80-12345678',
      email: 'info@abc.edu',
      website: 'https://www.abc.edu'
    }
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin',
    phone: '+91-9876543210',
    college: mockColleges[0]
  },
  {
    id: '2',
    name: 'Dr. John Smith',
    email: 'faculty@college.edu',
    role: 'faculty',
    phone: '+91-9876543211',
    department: 'Computer Science',
    college: mockColleges[0],
    profile: {
      employeeId: 'FAC001',
      designation: 'Professor',
      qualification: 'Ph.D. in Computer Science',
      experience: 15,
      specialization: 'Machine Learning'
    }
  },
  {
    id: '3',
    name: 'Jane Doe',
    email: 'student@college.edu',
    role: 'student',
    phone: '+91-9876543212',
    department: 'Computer Science',
    college: mockColleges[0],
    profile: {
      studentId: 'STU001',
      rollNumber: '20CS001',
      admissionYear: 2020,
      program: 'B.Tech Computer Science',
      batch: '2020-2024',
      semester: 7,
      status: 'active',
      admissionStatus: 'approved',
      hostelDetails: {
        roomNumber: 'A-101',
        blockName: 'Block A',
        allocated: true
      }
    }
  },
  {
    id: '4',
    name: 'Staff Member',
    email: 'staff@college.edu',
    role: 'staff',
    phone: '+91-9876543213',
    department: 'Admissions',
    college: mockColleges[0]
  }
];

export const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Computer Science & Engineering',
    code: 'CSE',
    head: mockUsers[1],
    establishedYear: 1995,
    description: 'Department of Computer Science and Engineering'
  },
  {
    id: '2',
    name: 'Electronics & Communication',
    code: 'ECE',
    head: mockUsers[1],
    establishedYear: 1996,
    description: 'Department of Electronics and Communication Engineering'
  },
  {
    id: '3',
    name: 'Mechanical Engineering',
    code: 'ME',
    head: mockUsers[1],
    establishedYear: 1997,
    description: 'Department of Mechanical Engineering'
  }
];

export const mockCourses: Course[] = [
  {
    id: '1',
    code: 'CS101',
    name: 'Programming Fundamentals',
    credits: 4,
    department: 'Computer Science',
    semester: 1,
    description: 'Introduction to programming concepts',
    faculty: mockUsers[1]
  },
  {
    id: '2',
    code: 'CS201',
    name: 'Data Structures',
    credits: 4,
    department: 'Computer Science',
    semester: 3,
    description: 'Data structures and algorithms',
    faculty: mockUsers[1]
  },
  {
    id: '3',
    code: 'CS301',
    name: 'Database Systems',
    credits: 3,
    department: 'Computer Science',
    semester: 5,
    description: 'Database design and management',
    faculty: mockUsers[1]
  }
];

export const mockFees: Fee[] = [
  {
    id: '1',
    studentId: '3',
    amount: 50000,
    type: 'tuition',
    dueDate: '2024-01-15',
    status: 'paid',
    paidAmount: 50000,
    paidDate: '2024-01-10',
    receipt: 'RCP001'
  },
  {
    id: '2',
    studentId: '3',
    amount: 25000,
    type: 'hostel',
    dueDate: '2024-02-15',
    status: 'pending'
  },
  {
    id: '3',
    studentId: '3',
    amount: 5000,
    type: 'library',
    dueDate: '2024-01-30',
    status: 'overdue'
  }
];

export const mockHostelRooms: HostelRoom[] = [
  {
    id: '1',
    roomNumber: 'A-101',
    blockName: 'Block A',
    capacity: 2,
    occupied: 1,
    type: 'double',
    facilities: ['WiFi', 'AC', 'Study Table', 'Wardrobe'],
    rent: 25000,
    status: 'occupied'
  },
  {
    id: '2',
    roomNumber: 'A-102',
    blockName: 'Block A',
    capacity: 2,
    occupied: 0,
    type: 'double',
    facilities: ['WiFi', 'AC', 'Study Table', 'Wardrobe'],
    rent: 25000,
    status: 'available'
  },
  {
    id: '3',
    roomNumber: 'B-201',
    blockName: 'Block B',
    capacity: 1,
    occupied: 1,
    type: 'single',
    facilities: ['WiFi', 'AC', 'Study Table', 'Wardrobe', 'Balcony'],
    rent: 35000,
    status: 'occupied'
  }
];

export const mockLibraryBooks: LibraryBook[] = [
  {
    id: '1',
    isbn: '978-0132350884',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Computer Science',
    totalCopies: 5,
    availableCopies: 3,
    location: 'CS-A-001'
  },
  {
    id: '2',
    isbn: '978-0596517748',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    category: 'Computer Science',
    totalCopies: 3,
    availableCopies: 1,
    location: 'CS-A-002'
  },
  {
    id: '3',
    isbn: '978-0134685991',
    title: 'Effective Java',
    author: 'Joshua Bloch',
    category: 'Computer Science',
    totalCopies: 4,
    availableCopies: 4,
    location: 'CS-A-003'
  }
];

export const mockBookIssues: BookIssue[] = [
  {
    id: '1',
    bookId: '1',
    studentId: '3',
    issueDate: '2024-01-10',
    dueDate: '2024-01-24',
    status: 'issued'
  },
  {
    id: '2',
    bookId: '2',
    studentId: '3',
    issueDate: '2024-01-05',
    dueDate: '2024-01-19',
    returnDate: '2024-01-18',
    status: 'returned'
  }
];

export const mockGrades: Grade[] = [
  {
    id: '1',
    studentId: '3',
    courseId: '1',
    semester: 1,
    marks: 85,
    totalMarks: 100,
    grade: 'A',
    credits: 4
  },
  {
    id: '2',
    studentId: '3',
    courseId: '2',
    semester: 3,
    marks: 78,
    totalMarks: 100,
    grade: 'B+',
    credits: 4
  }
];

export const mockAttendance: Attendance[] = [
  {
    id: '1',
    studentId: '3',
    courseId: '1',
    date: '2024-01-15',
    status: 'present',
    period: 1
  },
  {
    id: '2',
    studentId: '3',
    courseId: '1',
    date: '2024-01-16',
    status: 'absent',
    period: 1
  },
  {
    id: '3',
    studentId: '3',
    courseId: '2',
    date: '2024-01-15',
    status: 'present',
    period: 2
  }
];

export const mockNotices: Notice[] = [
  {
    id: '1',
    title: 'Semester Exam Schedule Released',
    content: 'The semester examination schedule for odd semester 2023-24 has been released. Students can check the schedule on the notice board.',
    type: 'exam',
    publishedDate: '2024-01-10',
    expiryDate: '2024-02-28',
    targetAudience: ['student']
  },
  {
    id: '2',
    title: 'Fee Payment Deadline Extended',
    content: 'The deadline for semester fee payment has been extended to January 31st, 2024. Late fee will be applicable after this date.',
    type: 'fee',
    publishedDate: '2024-01-15',
    expiryDate: '2024-01-31',
    targetAudience: ['student']
  },
  {
    id: '3',
    title: 'Faculty Meeting - January 20th',
    content: 'All faculty members are requested to attend the monthly faculty meeting on January 20th, 2024 at 2:00 PM in the conference hall.',
    type: 'general',
    publishedDate: '2024-01-12',
    expiryDate: '2024-01-20',
    targetAudience: ['faculty']
  }
];

export const mockApplications: Application[] = [
  {
    id: '1',
    studentName: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+91-9876543214',
    program: 'B.Tech Computer Science',
    status: 'submitted',
    submittedDate: '2024-01-10',
    documents: [
      { type: '10th Marksheet', status: 'verified' },
      { type: '12th Marksheet', status: 'verified' },
      { type: 'Transfer Certificate', status: 'pending' },
      { type: 'Passport Photo', status: 'uploaded' }
    ]
  },
  {
    id: '2',
    studentName: 'Bob Smith',
    email: 'bob@example.com',
    phone: '+91-9876543215',
    program: 'B.Tech Mechanical',
    status: 'under_review',
    submittedDate: '2024-01-08',
    documents: [
      { type: '10th Marksheet', status: 'verified' },
      { type: '12th Marksheet', status: 'verified' },
      { type: 'Transfer Certificate', status: 'verified' },
      { type: 'Passport Photo', status: 'verified' }
    ],
    reviewNotes: 'All documents verified. Awaiting final approval.'
  },
  {
    id: '3',
    studentName: 'Carol Davis',
    email: 'carol@example.com',
    phone: '+91-9876543216',
    program: 'B.Tech Electronics',
    status: 'documents_required',
    submittedDate: '2024-01-12',
    documents: [
      { type: '10th Marksheet', status: 'verified' },
      { type: '12th Marksheet', status: 'rejected' },
      { type: 'Transfer Certificate', status: 'pending' },
      { type: 'Passport Photo', status: 'uploaded' }
    ],
    reviewNotes: '12th marksheet quality is poor. Please upload a clearer copy.'
  }
];

// Dashboard Statistics
export const mockDashboardStats = {
  admin: {
    totalStudents: 1250,
    totalFaculty: 85,
    totalCourses: 120,
    pendingApplications: 45,
    totalRevenue: 15750000,
    hostelOccupancy: 78,
    libraryBooks: 25000,
    activeNotices: 8
  },
  student: {
    currentSemester: 7,
    totalCredits: 140,
    cgpa: 8.2,
    attendance: 85,
    pendingFees: 25000,
    issuedBooks: 2,
    upcomingExams: 4
  },
  faculty: {
    totalCourses: 3,
    totalStudents: 180,
    pendingAssignments: 25,
    averageAttendance: 82,
    upcomingClasses: 8
  },
  staff: {
    pendingApplications: 15,
    pendingPayments: 8,
    roomRequests: 12,
    libraryIssues: 5
  }
};

// Utility functions
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getStudentFees = (studentId: string): Fee[] => {
  return mockFees.filter(fee => fee.studentId === studentId);
};

export const getStudentGrades = (studentId: string): Grade[] => {
  return mockGrades.filter(grade => grade.studentId === studentId);
};

export const getStudentAttendance = (studentId: string): Attendance[] => {
  return mockAttendance.filter(attendance => attendance.studentId === studentId);
};

export const getStudentBooks = (studentId: string): BookIssue[] => {
  return mockBookIssues.filter(issue => issue.studentId === studentId && issue.status === 'issued');
};

export const getNoticesForRole = (role: string): Notice[] => {
  return mockNotices.filter(notice => 
    notice.targetAudience.includes(role as any) || notice.targetAudience.includes('all')
  );
};
