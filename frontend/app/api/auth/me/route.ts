import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Try to connect to backend first
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
  
  try {
    const authHeader = request.headers.get('Authorization')
    
    if (!authHeader) {
      return NextResponse.json({
        success: false,
        message: 'No authorization token provided'
      }, { status: 401 })
    }
    
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (backendError) {
    console.log('Backend not available, using demo mode')
  }
  
  // Demo mode - simulate backend authController.getMe response
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({
      success: false,
      message: 'No authorization token provided'
    }, { status: 401 })
  }
  
  const token = authHeader.split(' ')[1]
  
  // Extract user ID from demo token
  const userId = token.replace('demo-jwt-token-', '')
  
  const demoUsers = [
    {
      _id: '1',
      name: 'Admin User',
      email: 'admin@college.edu',
      role: 'admin',
      college: { _id: 'college1', name: 'Demo College', shortName: 'DC' },
      contactNumber: '+1-234-567-8901',
      dateOfBirth: new Date('1980-01-15'),
      gender: 'Male',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2',
      name: 'John Faculty',
      email: 'faculty@college.edu',
      role: 'faculty',
      college: { _id: 'college1', name: 'Demo College', shortName: 'DC' },
      contactNumber: '+1-234-567-8902',
      dateOfBirth: new Date('1985-03-20'),
      gender: 'Male',
      createdAt: new Date(),
      updatedAt: new Date(),
      facultyProfile: {
        _id: 'faculty1',
        employeeId: 'FAC001',
        designation: 'Associate Professor',
        department: { _id: 'dept1', name: 'Computer Science', shortName: 'CS' },
        qualification: {
          highestDegree: 'PhD',
          university: 'Demo University',
          specialization: 'Computer Science',
          yearOfCompletion: 2015
        },
        experience: { totalYears: 8 },
        expertise: ['Machine Learning', 'Data Structures'],
        employmentType: 'Permanent',
        joiningDate: new Date('2018-07-01'),
        courses: []
      }
    },
    {
      _id: '3',
      name: 'Jane Student',
      email: 'student@college.edu',
      role: 'student',
      college: { _id: 'college1', name: 'Demo College', shortName: 'DC' },
      contactNumber: '+1-234-567-8903',
      dateOfBirth: new Date('2002-05-10'),
      gender: 'Female',
      createdAt: new Date(),
      updatedAt: new Date(),
      studentProfile: {
        _id: 'student1',
        enrollmentNumber: 'STU2023001',
        batch: '2023-2027',
        program: 'Computer Science',
        degree: 'Bachelor of Technology',
        currentSemester: 3,
        department: { _id: 'dept1', name: 'Computer Science', shortName: 'CS' },
        academicYear: '2023-2024',
        admissionType: 'Regular',
        admissionCategory: 'General',
        guardianDetails: {
          name: 'John Doe Sr.',
          contactNumber: '+1-234-567-8904',
          email: 'guardian@example.com'
        },
        courses: []
      }
    }
  ]
  
  const user = demoUsers.find(u => u._id === userId)
  
  if (!user) {
    return NextResponse.json({
      success: false,
      message: 'User not found'
    }, { status: 404 })
  }
  
  return NextResponse.json({
    success: true,
    data: user
  })
}
