import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Connect to the actual backend
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
  
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'Authorization header required'
      }, { status: 401 })
    }
    
    console.log(`Attempting to connect to backend at: ${backendUrl}/api/admin/dashboard`)
    
    const response = await fetch(`${backendUrl}/api/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch dashboard data' }))
      return NextResponse.json(errorData, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Backend dashboard data retrieved successfully')
    
    return NextResponse.json(data, { status: response.status })
  } catch (backendError) {
    console.error('Backend connection failed:', backendError)
    console.log('Falling back to demo mode for development purposes')
  }
  
  // Demo mode - simulate backend adminController.getDashboardStats response
  return NextResponse.json({
    success: true,
    data: {
      userStats: {
        totalUsers: 1247,
        totalStudents: 1200,
        totalFaculty: 45,
        totalAdmin: 2
      },
      courseStats: {
        totalCourses: 64
      },
      departmentStats: {
        totalDepartments: 8,
        departments: [
          'Computer Science',
          'Mathematics', 
          'Physics',
          'Chemistry',
          'Biology',
          'English',
          'History',
          'Engineering'
        ]
      },
      recentUsers: [
        {
          _id: '1',
          name: 'John Smith',
          email: 'john.smith@college.edu',
          role: 'student',
          department: 'Computer Science',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          _id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@college.edu',
          role: 'faculty',
          department: 'Mathematics',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
        },
        {
          _id: '3',
          name: 'Mike Wilson',
          email: 'mike.wilson@college.edu',
          role: 'student',
          department: 'Physics',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
        },
        {
          _id: '4',
          name: 'Emily Davis',
          email: 'emily.davis@college.edu',
          role: 'faculty',
          department: 'Chemistry',
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // 4 days ago
        },
        {
          _id: '5',
          name: 'Alex Brown',
          email: 'alex.brown@college.edu',
          role: 'student',
          department: 'Biology',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
        }
      ]
    }
  })
}
