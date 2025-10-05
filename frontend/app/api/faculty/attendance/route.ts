import { NextRequest, NextResponse } from 'next/server';

// Mock realistic attendance data
const mockAttendanceData = {
  success: true,
  data: {
    sections: [
      {
        id: 'sec_001',
        courseCode: 'CSE301',
        courseName: 'Database Management Systems',
        sectionName: 'A',
        semester: 5,
        studentsCount: 42,
        averageAttendance: 89.2,
        lastAttendanceDate: '2024-12-20',
        students: [
          {
            id: 'std_001',
            rollNumber: 'CSE21001',
            name: 'Arjun Sharma',
            attendancePercentage: 92.5,
            totalClasses: 28,
            attendedClasses: 26,
            status: 'regular'
          },
          {
            id: 'std_002',
            rollNumber: 'CSE21002',
            name: 'Priya Patel',
            attendancePercentage: 89.3,
            totalClasses: 28,
            attendedClasses: 25,
            status: 'regular'
          },
          {
            id: 'std_003',
            rollNumber: 'CSE21003',
            name: 'Rahul Verma',
            attendancePercentage: 75.0,
            totalClasses: 28,
            attendedClasses: 21,
            status: 'irregular'
          },
          {
            id: 'std_004',
            rollNumber: 'CSE21004',
            name: 'Ananya Singh',
            attendancePercentage: 96.4,
            totalClasses: 28,
            attendedClasses: 27,
            status: 'excellent'
          },
          {
            id: 'std_005',
            rollNumber: 'CSE21005',
            name: 'Vikram Kumar',
            attendancePercentage: 82.1,
            totalClasses: 28,
            attendedClasses: 23,
            status: 'regular'
          }
        ]
      },
      {
        id: 'sec_002',
        courseCode: 'CSE405',
        courseName: 'Machine Learning',
        sectionName: 'B',
        semester: 7,
        studentsCount: 38,
        averageAttendance: 91.3,
        lastAttendanceDate: '2024-12-19',
        students: [
          {
            id: 'std_101',
            rollNumber: 'CSE19001',
            name: 'Shreya Gupta',
            attendancePercentage: 95.8,
            totalClasses: 24,
            attendedClasses: 23,
            status: 'excellent'
          },
          {
            id: 'std_102',
            rollNumber: 'CSE19002',
            name: 'Amit Joshi',
            attendancePercentage: 87.5,
            totalClasses: 24,
            attendedClasses: 21,
            status: 'regular'
          },
          {
            id: 'std_103',
            rollNumber: 'CSE19003',
            name: 'Neha Reddy',
            attendancePercentage: 91.7,
            totalClasses: 24,
            attendedClasses: 22,
            status: 'regular'
          }
        ]
      }
    ],
    attendanceStats: {
      totalSections: 4,
      totalStudents: 156,
      overallAttendance: 87.5,
      excellentAttendance: 42, // >90%
      regularAttendance: 89,   // 75-90%
      poorAttendance: 25,      // <75%
      averageClassesPerWeek: 12,
      attendanceMarkedToday: 3,
      pendingAttendance: 1
    }
  }
};

// Mock data for marking attendance
const mockMarkAttendanceResponse = {
  success: true,
  message: 'Attendance marked successfully',
  data: {
    sectionId: 'sec_001',
    courseCode: 'CSE301',
    date: new Date().toISOString().split('T')[0],
    totalStudents: 42,
    presentCount: 38,
    absentCount: 4,
    attendancePercentage: 90.5,
    markedBy: 'Dr. Rajesh Kumar',
    timestamp: new Date().toISOString()
  }
};

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[API] Fetching attendance data:', { action });

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 300));

    if (action === 'stats') {
      return NextResponse.json({
        success: true,
        data: mockAttendanceData.data.attendanceStats
      });
    }

    return NextResponse.json(mockAttendanceData);
  } catch (error) {
    console.error('[API] Attendance fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[API] Marking attendance:', body);

    // Validate required fields
    if (!body.sectionId || !body.attendanceData) {
      return NextResponse.json(
        { success: false, message: 'Section ID and attendance data are required' },
        { status: 400 }
      );
    }

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Update the mock response with actual data
    const response = {
      ...mockMarkAttendanceResponse,
      data: {
        ...mockMarkAttendanceResponse.data,
        sectionId: body.sectionId,
        courseCode: body.courseCode || 'CSE301',
        totalStudents: body.attendanceData.length,
        presentCount: body.attendanceData.filter((student: any) => student.status === 'present').length,
        absentCount: body.attendanceData.filter((student: any) => student.status === 'absent').length,
      }
    };

    response.data.attendancePercentage = ((response.data.presentCount / response.data.totalStudents) * 100);

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] Mark attendance error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
