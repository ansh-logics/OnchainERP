// Mock data for admin endpoints

export const mockAdminDashboard = {
  success: true,
  data: {
    overview: {
      totalStudents: 1250,
      totalFaculty: 85,
      totalStaff: 45,
      totalDepartments: 12,
      activeAdmissions: 320,
      pendingFees: 2450000,
      revenue: 18500000,
      hostelOccupancy: 92
    },
    recentActivities: [
      {
        id: '1',
        type: 'admission',
        message: '25 new students admitted to Computer Science',
        timestamp: '2025-01-15T10:30:00Z',
        user: 'Admission Office'
      },
      {
        id: '2',
        type: 'payment',
        message: 'Fee payment of ₹45,000 received from Roll No. CS21001',
        timestamp: '2025-01-15T09:15:00Z',
        user: 'Finance Department'
      },
      {
        id: '3',
        type: 'faculty',
        message: 'New faculty member Dr. Anjali Verma joined ECE Department',
        timestamp: '2025-01-14T14:20:00Z',
        user: 'HR Department'
      }
    ],
    upcomingEvents: [
      {
        id: '1',
        title: 'Mid-Semester Examinations',
        date: '2025-02-15',
        type: 'exam',
        status: 'scheduled'
      },
      {
        id: '2',
        title: 'Faculty Development Program',
        date: '2025-02-20',
        type: 'training',
        status: 'scheduled'
      }
    ]
  }
};

export const mockStudentsList = {
  success: true,
  data: {
    students: Array.from({ length: 20 }, (_, i) => ({
      id: `student_${i + 1}`,
      rollNumber: `CS21${String(i + 1).padStart(3, '0')}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@college.edu`,
      department: 'Computer Science & Engineering',
      semester: Math.floor(Math.random() * 8) + 1,
      section: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      cgpa: (Math.random() * 3 + 7).toFixed(2),
      status: 'active'
    })),
    pagination: {
      currentPage: 1,
      totalPages: 63,
      totalItems: 1250,
      itemsPerPage: 20
    }
  }
};

export const mockFacultyList = {
  success: true,
  data: {
    faculty: [
      {
        id: 'faculty_1',
        employeeId: 'FAC2023001',
        name: 'Dr. Rajesh Kumar',
        email: 'rajesh.kumar@college.edu',
        department: 'Computer Science & Engineering',
        designation: 'Associate Professor',
        specialization: 'Machine Learning',
        experience: 12,
        status: 'active'
      },
      {
        id: 'faculty_2',
        employeeId: 'FAC2023002',
        name: 'Dr. Priya Sharma',
        email: 'priya.sharma@college.edu',
        department: 'Electronics & Communication',
        designation: 'Assistant Professor',
        specialization: 'VLSI Design',
        experience: 8,
        status: 'active'
      },
      {
        id: 'faculty_3',
        employeeId: 'FAC2023003',
        name: 'Prof. Amit Verma',
        email: 'amit.verma@college.edu',
        department: 'Mechanical Engineering',
        designation: 'Professor',
        specialization: 'Robotics',
        experience: 20,
        status: 'active'
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 85,
      itemsPerPage: 20
    }
  }
};

export const mockDepartments = {
  success: true,
  data: {
    departments: [
      {
        id: 'dept_1',
        code: 'CSE',
        name: 'Computer Science & Engineering',
        hodName: 'Dr. Suresh Patel',
        totalFaculty: 18,
        totalStudents: 420,
        programs: ['B.Tech', 'M.Tech', 'Ph.D.']
      },
      {
        id: 'dept_2',
        code: 'ECE',
        name: 'Electronics & Communication Engineering',
        hodName: 'Dr. Ramesh Singh',
        totalFaculty: 15,
        totalStudents: 380,
        programs: ['B.Tech', 'M.Tech']
      },
      {
        id: 'dept_3',
        code: 'ME',
        name: 'Mechanical Engineering',
        hodName: 'Dr. Vikram Reddy',
        totalFaculty: 12,
        totalStudents: 280,
        programs: ['B.Tech', 'M.Tech', 'Ph.D.']
      },
      {
        id: 'dept_4',
        code: 'CE',
        name: 'Civil Engineering',
        hodName: 'Dr. Anjali Gupta',
        totalFaculty: 10,
        totalStudents: 170,
        programs: ['B.Tech', 'M.Tech']
      }
    ]
  }
};

export const mockFeesPayments = {
  success: true,
  data: {
    payments: Array.from({ length: 15 }, (_, i) => ({
      id: `payment_${i + 1}`,
      studentName: `Student ${i + 1}`,
      rollNumber: `CS21${String(i + 1).padStart(3, '0')}`,
      amount: 45000 + Math.floor(Math.random() * 10000),
      paymentDate: new Date(2025, 0, 15 - i).toISOString(),
      semester: 'Semester 6',
      status: ['completed', 'pending', 'failed'][Math.floor(Math.random() * 3)],
      transactionId: `TXN${Date.now() - i * 1000000}`
    })),
    summary: {
      totalCollected: 18500000,
      totalPending: 2450000,
      totalStudents: 1250,
      paidStudents: 980,
      partiallyPaid: 180,
      unpaid: 90
    }
  }
};

export const mockAdmissions = {
  success: true,
  data: {
    applications: Array.from({ length: 12 }, (_, i) => ({
      id: `app_${i + 1}`,
      applicationNumber: `APP2025${String(i + 1).padStart(4, '0')}`,
      name: `Applicant ${i + 1}`,
      email: `applicant${i + 1}@email.com`,
      phone: `+91 9876${String(54321 + i).slice(-5)}`,
      program: 'B.Tech',
      department: ['CSE', 'ECE', 'ME', 'CE'][Math.floor(Math.random() * 4)],
      status: ['pending', 'approved', 'rejected', 'under_review'][Math.floor(Math.random() * 4)],
      applicationDate: new Date(2025, 0, 10 - i).toISOString(),
      marks: Math.floor(Math.random() * 20) + 80
    })),
    summary: {
      total: 320,
      pending: 120,
      approved: 150,
      rejected: 30,
      underReview: 20
    }
  }
};

export const mockHostelAllocation = {
  success: true,
  data: {
    allocations: Array.from({ length: 10 }, (_, i) => ({
      id: `alloc_${i + 1}`,
      studentName: `Student ${i + 1}`,
      rollNumber: `CS21${String(i + 1).padStart(3, '0')}`,
      block: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
      roomNumber: `${Math.floor(Math.random() * 3) + 1}${String(Math.floor(Math.random() * 50) + 1).padStart(2, '0')}`,
      roomType: ['Single', 'Double', 'Triple'][Math.floor(Math.random() * 3)],
      checkInDate: '2024-08-01',
      status: 'active'
    })),
    summary: {
      totalRooms: 500,
      occupied: 460,
      available: 40,
      occupancyRate: 92
    }
  }
};

export const mockExamSchedule = {
  success: true,
  data: {
    exams: [
      {
        id: 'exam_1',
        courseCode: 'CS301',
        courseName: 'Data Structures & Algorithms',
        examType: 'Mid-term',
        date: '2025-02-15',
        time: '09:00 AM - 12:00 PM',
        duration: 180,
        hall: 'Exam Hall 1',
        semester: 5,
        students: 120
      },
      {
        id: 'exam_2',
        courseCode: 'CS302',
        courseName: 'Database Management Systems',
        examType: 'Mid-term',
        date: '2025-02-17',
        time: '02:00 PM - 05:00 PM',
        duration: 180,
        hall: 'Exam Hall 2',
        semester: 5,
        students: 115
      },
      {
        id: 'exam_3',
        courseCode: 'EC401',
        courseName: 'Digital Signal Processing',
        examType: 'Final',
        date: '2025-05-20',
        time: '09:00 AM - 12:00 PM',
        duration: 180,
        hall: 'Exam Hall 3',
        semester: 7,
        students: 85
      }
    ]
  }
};

export const mockAttendanceReports = {
  success: true,
  data: {
    reports: [
      {
        department: 'Computer Science & Engineering',
        semester: 5,
        averageAttendance: 87.5,
        totalStudents: 420,
        excellentAttendance: 180,
        regularAttendance: 200,
        poorAttendance: 40
      },
      {
        department: 'Electronics & Communication',
        semester: 5,
        averageAttendance: 89.2,
        totalStudents: 380,
        excellentAttendance: 170,
        regularAttendance: 190,
        poorAttendance: 20
      },
      {
        department: 'Mechanical Engineering',
        semester: 5,
        averageAttendance: 85.8,
        totalStudents: 280,
        excellentAttendance: 120,
        regularAttendance: 140,
        poorAttendance: 20
      }
    ]
  }
};

export const getMockAdminData = (path: string) => {
  if (path.includes('/dashboard')) {
    return mockAdminDashboard;
  }
  if (path.includes('/users') || path.includes('/students')) {
    return mockStudentsList;
  }
  if (path.includes('/faculty')) {
    return mockFacultyList;
  }
  if (path.includes('/departments')) {
    return mockDepartments;
  }
  if (path.includes('/fees-payments') || path.includes('/fee-management')) {
    return mockFeesPayments;
  }
  if (path.includes('/admissions')) {
    return mockAdmissions;
  }
  if (path.includes('/hostel')) {
    return mockHostelAllocation;
  }
  if (path.includes('/exam')) {
    return mockExamSchedule;
  }
  if (path.includes('/attendance-reports')) {
    return mockAttendanceReports;
  }
  
  return {
    success: false,
    message: 'Endpoint not configured for mock data'
  };
};
