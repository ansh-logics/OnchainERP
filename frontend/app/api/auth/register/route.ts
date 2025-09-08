import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body
  
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Invalid JSON body'
    }, { status: 400 })
  }
  
  // Try to connect to backend first
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
  
  try {
    const authHeader = request.headers.get('Authorization')
    
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (backendError) {
    console.log('Backend not available, using demo mode')
  }
  
  // Demo mode - simulate backend authController.register response
  const {
    name,
    email,
    password,
    role,
    department,
    contactNumber,
    dateOfBirth,
    gender,
    // Student specific fields
    enrollmentNumber,
    batch,
    program,
    currentSemester,
    degree,
    admissionCategory,
    // Faculty specific fields
    employeeId,
    designation,
    qualification,
    joiningDate,
    employmentType
  } = body
  
  // Validate required fields
  if (!name || !email || !password || !role || !['student', 'faculty'].includes(role)) {
    return NextResponse.json({
      success: false,
      message: 'Please provide all required fields with valid role (student or faculty)'
    }, { status: 400 })
  }
  
  // Validate role-specific required fields
  if (role === 'student' && (!enrollmentNumber || !batch || !program || !currentSemester || !degree || !admissionCategory)) {
    return NextResponse.json({
      success: false,
      message: 'Please provide all required student information'
    }, { status: 400 })
  }
  
  if (role === 'faculty' && (!employeeId || !designation || !qualification || !joiningDate || !employmentType)) {
    return NextResponse.json({
      success: false,
      message: 'Please provide all required faculty information'
    }, { status: 400 })
  }
  
  // Simulate successful registration
  const userId = `user_${Date.now()}`
  const collegeId = 'college1' // Demo college
  
  const userData: any = {
    _id: userId,
    name,
    email,
    role,
    college: { _id: collegeId, name: 'Demo College', shortName: 'DC' },
    contactNumber,
    dateOfBirth,
    gender,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  if (role === 'student') {
    userData.studentId = enrollmentNumber
  } else if (role === 'faculty') {
    userData.facultyId = employeeId
  }
  
  return NextResponse.json({
    success: true,
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
    data: userData
  })
}
