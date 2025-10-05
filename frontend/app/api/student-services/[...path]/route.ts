import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

// Mock data for various student endpoints
const getMockData = (path: string) => {
  // Dashboard endpoint
  if (path.includes('/dashboard') || path === '/') {
    return {
      success: true,
      data: {
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
          profilePicture: '/uploads/profile/student_default.jpg'
        },
        analytics: {
          attendance: 87.5,
          cgpa: 8.75,
          enrolledCourses: 5,
          currentSemester: 6,
          creditsCompleted: 140,
          totalCredits: 180
        },
        pendingFees: {
          count: 2,
          totalAmount: 49500
        },
        upcomingExams: [
          {
            id: '3',
            subject: 'Computer Networks',
            examType: 'final',
            maxMarks: 100,
            examDate: '2025-05-20',
            status: 'scheduled'
          },
          {
            id: '4',
            subject: 'Operating Systems',
            examType: 'final',
            maxMarks: 100,
            examDate: '2025-05-22',
            status: 'scheduled'
          }
        ],
        todaySchedule: [
          {
            time: '9:00 AM',
            course: 'Data Structures & Algorithms',
            room: 'CS-201',
            type: 'Lecture',
            instructor: 'Dr. Sarah Johnson'
          },
          {
            time: '11:00 AM',
            course: 'Database Management Systems',
            room: 'CS-205',
            type: 'Lab',
            instructor: 'Prof. Michael Chen'
          }
        ],
        recentGrades: [
          {
            course: 'Data Structures & Algorithms',
            assignment: 'Mid-term Exam',
            grade: 'A',
            points: '85/100',
            date: '2025-02-15'
          },
          {
            course: 'Database Management Systems',
            assignment: 'Project Submission',
            grade: 'A+',
            points: '92/100',
            date: '2025-02-12'
          }
        ]
      }
    };
  }

  // Attendance endpoint
  if (path.includes('/attendance')) {
    return {
      success: true,
      data: {
        overallStats: {
          totalClasses: 180,
          present: 158,
          absent: 15,
          late: 5,
          excused: 2,
          overallPercentage: 87.8
        },
        subjectWiseStats: [
          {
            courseCode: 'CS301',
            courseName: 'Data Structures and Algorithms',
            totalClasses: 45,
            present: 42,
            absent: 2,
            late: 1,
            percentage: 93.3
          },
          {
            courseCode: 'CS302',
            courseName: 'Database Management Systems',
            totalClasses: 40,
            present: 35,
            absent: 3,
            late: 2,
            percentage: 87.5
          },
          {
            courseCode: 'CS303',
            courseName: 'Computer Networks',
            totalClasses: 38,
            present: 30,
            absent: 6,
            late: 1,
            percentage: 78.9
          }
        ]
      }
    };
  }

  // Profile endpoint
  if (path.includes('/profile')) {
    return {
      success: true,
      data: {
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
        profilePicture: '/uploads/profile/student_default.jpg'
      }
    };
  }

  // Courses endpoint
  if (path.includes('/courses')) {
    return {
      success: true,
      data: [
        {
          id: '1',
          code: 'CS301',
          name: 'Data Structures & Algorithms',
          instructor: 'Dr. Sarah Johnson',
          credits: 4,
          progress: 85,
          grade: 'A',
          schedule: 'MWF 9:00-10:00 AM',
          room: 'CS-201'
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
          room: 'CS-205'
        }
      ]
    };
  }

  // Fees endpoint
  if (path.includes('/fees')) {
    return {
      success: true,
      data: {
        feeRecords: [
          {
            id: '1',
            semester: 'Semester 6',
            category: 'Tuition Fee',
            amount: '45000',
            dueDate: '2024-01-15',
            paidDate: '2024-01-10',
            status: 'paid',
            type: 'tuition'
          },
          {
            id: '3',
            semester: 'Semester 7',
            category: 'Tuition Fee',
            amount: '47000',
            dueDate: '2025-07-15',
            status: 'pending',
            type: 'tuition'
          }
        ],
        summary: {
          totalFees: 109500,
          paidAmount: 60000,
          remainingAmount: 49500,
          feeStatus: 'Partial'
        }
      }
    };
  }

  // Default response
  return {
    success: false,
    message: 'Endpoint not configured for mock data'
  };
};

async function handleRequest(req: NextRequest, method: string) {
  try {
    // Extract the path from the URL
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/api/student-services')[1] || '';
    const backendUrl = `${BACKEND_URL}/api/student-services${pathSegments}${url.search}`;

    // Get the authorization header from the request
    const authorization = req.headers.get('authorization');
    
    // Prepare headers for backend request
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        const body = await req.text();
        if (body) {
          requestOptions.body = body;
        }
      } catch (error) {
        console.error('Error reading request body:', error);
      }
    }

    console.log(`[API Proxy] ${method} ${backendUrl}`);

    try {
      // Make request to backend
      const response = await fetch(backendUrl, requestOptions);
      
      // Get response data
      const data = await response.text();
      
      console.log(`[API Proxy] Response status: ${response.status}`);

      // If backend responds successfully, return it
      if (response.ok) {
        return new Response(data, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            'Content-Type': 'application/json',
            ...Object.fromEntries(response.headers.entries()),
          },
        });
      }

      // If backend fails and it's a GET request, try mock data
      if (method === 'GET') {
        console.log('[API Proxy] Backend failed, using mock data');
        const mockData = getMockData(pathSegments);
        return new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // For non-GET requests, return the backend error
      return new Response(data, {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (fetchError) {
      // Backend is not reachable
      console.log('[API Proxy] Backend not reachable, using mock data');
      
      if (method === 'GET') {
        const mockData = getMockData(pathSegments);
        return new Response(JSON.stringify(mockData), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      throw fetchError;
    }

  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

export async function GET(req: NextRequest) {
  return handleRequest(req, 'GET');
}

export async function POST(req: NextRequest) {
  return handleRequest(req, 'POST');
}

export async function PUT(req: NextRequest) {
  return handleRequest(req, 'PUT');
}

export async function DELETE(req: NextRequest) {
  return handleRequest(req, 'DELETE');
}

export async function PATCH(req: NextRequest) {
  return handleRequest(req, 'PATCH');
}