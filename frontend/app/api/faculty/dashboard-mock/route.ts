import { NextRequest, NextResponse } from 'next/server';

// Mock realistic faculty data that doesn't look fake
const mockFacultyData = {
  success: true,
  data: {
    facultyInfo: {
      id: 'faculty_67831',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@college.edu',
      employeeId: 'FAC2023001',
      designation: 'Associate Professor',
      department: {
        id: 'dept_cs_001',
        name: 'Computer Science & Engineering',
        code: 'CSE'
      },
      qualification: 'Ph.D. in Computer Science',
      experience: 12,
      specialization: ['Machine Learning', 'Data Mining', 'Algorithms'],
      profilePicture: '/uploads/profile/faculty_67831.jpg',
      joiningDate: '2018-07-15'
    },
    dashboardMetrics: {
      totalCourses: 4,
      totalStudents: 156,
      totalSections: 6,
      averageAttendance: 87.5,
      pendingGrading: 23,
      completedAssignments: 18,
      upcomingExams: 3
    },
    todaySchedule: [
      {
        id: 'class_001',
        courseCode: 'CSE301',
        courseName: 'Database Management Systems',
        section: 'A',
        timeSlot: '09:00 AM - 10:00 AM',
        room: 'CSE-301',
        type: 'Lecture',
        studentsCount: 42,
        status: 'scheduled'
      },
      {
        id: 'class_002',
        courseCode: 'CSE405',
        courseName: 'Machine Learning',
        section: 'B',
        timeSlot: '11:00 AM - 12:30 PM',
        room: 'CSE-401',
        type: 'Lab',
        studentsCount: 38,
        status: 'scheduled'
      },
      {
        id: 'class_003',
        courseCode: 'CSE301',
        courseName: 'Database Management Systems',
        section: 'C',
        timeSlot: '02:00 PM - 03:00 PM',
        room: 'CSE-302',
        type: 'Tutorial',
        studentsCount: 35,
        status: 'scheduled'
      }
    ],
    courses: [
      {
        id: 'course_001',
        code: 'CSE301',
        name: 'Database Management Systems',
        semester: 5,
        credits: 4,
        sections: [
          { id: 'sec_001', name: 'A', studentsCount: 42, averageAttendance: 89.2 },
          { id: 'sec_002', name: 'C', studentsCount: 35, averageAttendance: 85.7 }
        ],
        totalStudents: 77,
        averageAttendance: 87.6,
        completedClasses: 28,
        totalClasses: 32,
        upcomingAssignments: 2
      },
      {
        id: 'course_002',
        code: 'CSE405',
        name: 'Machine Learning',
        semester: 7,
        credits: 3,
        sections: [
          { id: 'sec_003', name: 'B', studentsCount: 38, averageAttendance: 91.3 }
        ],
        totalStudents: 38,
        averageAttendance: 91.3,
        completedClasses: 24,
        totalClasses: 30,
        upcomingAssignments: 1
      },
      {
        id: 'course_003',
        code: 'CSE201',
        name: 'Data Structures & Algorithms',
        semester: 3,
        credits: 4,
        sections: [
          { id: 'sec_004', name: 'A', studentsCount: 41, averageAttendance: 82.4 }
        ],
        totalStudents: 41,
        averageAttendance: 82.4,
        completedClasses: 26,
        totalClasses: 32,
        upcomingAssignments: 3
      }
    ],
    recentActivities: [
      {
        id: 'activity_001',
        type: 'attendance',
        message: 'Marked attendance for CSE301 Section A - 40/42 students present',
        timestamp: '2024-12-20T09:30:00Z',
        courseCode: 'CSE301'
      },
      {
        id: 'activity_002',
        type: 'grading',
        message: 'Completed grading for Assignment 3 - Database Design',
        timestamp: '2024-12-19T16:45:00Z',
        courseCode: 'CSE301'
      },
      {
        id: 'activity_003',
        type: 'announcement',
        message: 'Posted study materials for Machine Learning mid-term exam',
        timestamp: '2024-12-19T14:20:00Z',
        courseCode: 'CSE405'
      },
      {
        id: 'activity_004',
        type: 'assignment',
        message: 'Created new assignment: Algorithm Complexity Analysis',
        timestamp: '2024-12-18T11:15:00Z',
        courseCode: 'CSE201'
      }
    ],
    pendingTasks: [
      {
        id: 'task_001',
        type: 'grading',
        title: 'Grade ML Project Submissions',
        courseCode: 'CSE405',
        dueDate: '2024-12-22',
        priority: 'high',
        count: 12
      },
      {
        id: 'task_002',
        type: 'attendance',
        title: 'Submit Attendance Report',
        courseCode: 'CSE301',
        dueDate: '2024-12-21',
        priority: 'medium',
        count: 1
      },
      {
        id: 'task_003',
        type: 'assignment',
        title: 'Review Assignment Submissions',
        courseCode: 'CSE201',
        dueDate: '2024-12-23',
        priority: 'medium',
        count: 23
      }
    ],
    upcomingEvents: [
      {
        id: 'event_001',
        title: 'Faculty Meeting - Curriculum Review',
        date: '2024-12-21',
        time: '10:00 AM',
        location: 'Conference Room A',
        type: 'meeting'
      },
      {
        id: 'event_002',
        title: 'CSE405 Mid-term Examination',
        date: '2024-12-23',
        time: '09:00 AM - 12:00 PM',
        location: 'Exam Hall 2',
        type: 'exam'
      },
      {
        id: 'event_003',
        title: 'Parent-Teacher Conference',
        date: '2024-12-24',
        time: '02:00 PM - 05:00 PM',
        location: 'CSE Department',
        type: 'conference'
      }
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[API] Fetching faculty dashboard data (mock)');

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json(mockFacultyData);
  } catch (error) {
    console.error('[API] Faculty dashboard error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
