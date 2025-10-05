import { NextRequest, NextResponse } from 'next/server';

// Mock realistic faculty courses data
const mockCoursesData = {
  success: true,
  data: {
    courses: [
      {
        id: 'course_001',
        code: 'CSE301',
        name: 'Database Management Systems',
        semester: 5,
        academicYear: '2024-25',
        credits: 4,
        courseType: 'Core',
        description: 'Introduction to database concepts, design, and implementation using SQL and NoSQL systems.',
        sections: [
          {
            id: 'sec_001',
            name: 'Section A',
            studentsCount: 42,
            schedule: [
              { day: 'Monday', time: '09:00 AM - 10:00 AM', room: 'CSE-301', type: 'Lecture' },
              { day: 'Wednesday', time: '09:00 AM - 10:00 AM', room: 'CSE-301', type: 'Lecture' },
              { day: 'Friday', time: '11:00 AM - 01:00 PM', room: 'CSE-Lab-2', type: 'Lab' }
            ],
            averageAttendance: 89.2,
            lastClassDate: '2024-12-20',
            upcomingClass: { date: '2024-12-23', time: '09:00 AM', room: 'CSE-301', type: 'Lecture' }
          },
          {
            id: 'sec_002',
            name: 'Section C',
            studentsCount: 35,
            schedule: [
              { day: 'Tuesday', time: '02:00 PM - 03:00 PM', room: 'CSE-302', type: 'Tutorial' },
              { day: 'Thursday', time: '02:00 PM - 03:00 PM', room: 'CSE-302', type: 'Lecture' },
              { day: 'Friday', time: '02:00 PM - 04:00 PM', room: 'CSE-Lab-1', type: 'Lab' }
            ],
            averageAttendance: 85.7,
            lastClassDate: '2024-12-19',
            upcomingClass: { date: '2024-12-23', time: '02:00 PM', room: 'CSE-302', type: 'Lecture' }
          }
        ],
        totalStudents: 77,
        averageAttendance: 87.6,
        completedClasses: 28,
        totalClasses: 40,
        progressPercentage: 70,
        upcomingAssignments: [
          {
            id: 'assign_001',
            title: 'Database Normalization',
            dueDate: '2024-12-25',
            type: 'Assignment',
            maxMarks: 50
          },
          {
            id: 'assign_002',
            title: 'SQL Query Optimization',
            dueDate: '2024-12-28',
            type: 'Project',
            maxMarks: 100
          }
        ],
        recentTopics: [
          'Transaction Management',
          'Concurrency Control',
          'Database Recovery',
          'Query Optimization'
        ]
      },
      {
        id: 'course_002',
        code: 'CSE405',
        name: 'Machine Learning',
        semester: 7,
        academicYear: '2024-25',
        credits: 3,
        courseType: 'Elective',
        description: 'Fundamental concepts of machine learning including supervised, unsupervised, and reinforcement learning.',
        sections: [
          {
            id: 'sec_003',
            name: 'Section B',
            studentsCount: 38,
            schedule: [
              { day: 'Tuesday', time: '11:00 AM - 12:30 PM', room: 'CSE-401', type: 'Lecture' },
              { day: 'Thursday', time: '11:00 AM - 12:30 PM', room: 'CSE-401', type: 'Lab' },
              { day: 'Friday', time: '03:00 PM - 04:00 PM', room: 'CSE-401', type: 'Tutorial' }
            ],
            averageAttendance: 91.3,
            lastClassDate: '2024-12-19',
            upcomingClass: { date: '2024-12-24', time: '11:00 AM', room: 'CSE-401', type: 'Lecture' }
          }
        ],
        totalStudents: 38,
        averageAttendance: 91.3,
        completedClasses: 24,
        totalClasses: 30,
        progressPercentage: 80,
        upcomingAssignments: [
          {
            id: 'assign_003',
            title: 'Neural Network Implementation',
            dueDate: '2024-12-26',
            type: 'Project',
            maxMarks: 100
          }
        ],
        recentTopics: [
          'Deep Learning Fundamentals',
          'Convolutional Neural Networks',
          'Recurrent Neural Networks',
          'Model Evaluation Metrics'
        ]
      },
      {
        id: 'course_003',
        code: 'CSE201',
        name: 'Data Structures & Algorithms',
        semester: 3,
        academicYear: '2024-25',
        credits: 4,
        courseType: 'Core',
        description: 'Comprehensive study of data structures, algorithm design, and complexity analysis.',
        sections: [
          {
            id: 'sec_004',
            name: 'Section A',
            studentsCount: 41,
            schedule: [
              { day: 'Monday', time: '11:00 AM - 12:00 PM', room: 'CSE-201', type: 'Lecture' },
              { day: 'Wednesday', time: '11:00 AM - 12:00 PM', room: 'CSE-201', type: 'Lecture' },
              { day: 'Friday', time: '09:00 AM - 11:00 AM', room: 'CSE-Lab-3', type: 'Lab' }
            ],
            averageAttendance: 82.4,
            lastClassDate: '2024-12-18',
            upcomingClass: { date: '2024-12-23', time: '11:00 AM', room: 'CSE-201', type: 'Lecture' }
          }
        ],
        totalStudents: 41,
        averageAttendance: 82.4,
        completedClasses: 26,
        totalClasses: 36,
        progressPercentage: 72,
        upcomingAssignments: [
          {
            id: 'assign_004',
            title: 'Binary Search Tree Implementation',
            dueDate: '2024-12-22',
            type: 'Assignment',
            maxMarks: 75
          },
          {
            id: 'assign_005',
            title: 'Graph Algorithms',
            dueDate: '2024-12-27',
            type: 'Assignment',
            maxMarks: 75
          },
          {
            id: 'assign_006',
            title: 'Dynamic Programming Solutions',
            dueDate: '2024-12-30',
            type: 'Project',
            maxMarks: 100
          }
        ],
        recentTopics: [
          'Graph Traversal Algorithms',
          'Shortest Path Algorithms',
          'Minimum Spanning Trees',
          'Dynamic Programming'
        ]
      },
      {
        id: 'course_004',
        code: 'CSE599',
        name: 'Research Methodology',
        semester: 8,
        academicYear: '2024-25',
        credits: 2,
        courseType: 'Elective',
        description: 'Introduction to research methods, paper writing, and academic presentation skills.',
        sections: [
          {
            id: 'sec_005',
            name: 'Section A',
            studentsCount: 28,
            schedule: [
              { day: 'Wednesday', time: '03:00 PM - 05:00 PM', room: 'CSE-Conference', type: 'Seminar' }
            ],
            averageAttendance: 94.6,
            lastClassDate: '2024-12-18',
            upcomingClass: { date: '2024-12-25', time: '03:00 PM', room: 'CSE-Conference', type: 'Seminar' }
          }
        ],
        totalStudents: 28,
        averageAttendance: 94.6,
        completedClasses: 12,
        totalClasses: 15,
        progressPercentage: 80,
        upcomingAssignments: [
          {
            id: 'assign_007',
            title: 'Literature Survey',
            dueDate: '2024-12-29',
            type: 'Report',
            maxMarks: 50
          }
        ],
        recentTopics: [
          'Research Ethics',
          'Citation Methods',
          'Statistical Analysis',
          'Academic Writing'
        ]
      }
    ],
    summary: {
      totalCourses: 4,
      totalSections: 6,
      totalStudents: 184,
      averageAttendance: 88.5,
      totalCredits: 13,
      upcomingClasses: 8,
      pendingAssignments: 7,
      completedAssignments: 12
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[API] Fetching faculty courses:', { courseId });

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 400));

    if (courseId) {
      // Return specific course details
      const course = mockCoursesData.data.courses.find(c => c.id === courseId);
      if (!course) {
        return NextResponse.json(
          { success: false, message: 'Course not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: course
      });
    }

    return NextResponse.json(mockCoursesData);
  } catch (error) {
    console.error('[API] Faculty courses error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
