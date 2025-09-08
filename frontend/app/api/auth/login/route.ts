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
  
  const { email, password } = body
  
  if (!email || !password) {
    return NextResponse.json({
      success: false,
      message: 'Please provide an email and password'
    }, { status: 400 })
  }
  
  // Connect to the actual backend
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
  
  try {
    console.log(`Attempting to connect to backend at: ${backendUrl}/api/auth/login`)
    console.log('Request body:', { email, password: '***' })
    
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })
    
    console.log('Backend response status:', response.status)
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Authentication failed' }))
      console.log('Backend error data:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }
    
    const data = await response.json()
    console.log('Backend authentication successful, data received:', {
      success: data.success,
      hasToken: !!data.token,
      userRole: data.user?.role || 'no user data',
      userId: data.user?.id || 'no user id'
    })
    
    return NextResponse.json(data, { status: response.status })
  } catch (backendError) {
    console.error('Backend connection failed:', backendError)
    console.log('Error details:', {
      name: (backendError as Error).name || 'Unknown',
      message: (backendError as Error).message || 'Unknown error',
      cause: (backendError as any).cause || 'No cause'
    })
    console.log('Falling back to demo mode for development purposes')
  }
  
  // Demo mode - simulate backend controller response
  const demoUsers = [
    {
      _id: '1',
      name: 'Admin User',
      email: 'admin@college.edu',
      role: 'admin',
      college: { _id: 'college1', name: 'Demo College', shortName: 'DC' },
      createdAt: new Date()
    },
    {
      _id: '2', 
      name: 'John Faculty',
      email: 'faculty@college.edu',
      role: 'faculty',
      college: { _id: 'college1', name: 'Demo College', shortName: 'DC' },
      createdAt: new Date()
    },
    {
      _id: '3',
      name: 'Jane Student', 
      email: 'student@college.edu',
      role: 'student',
      college: { _id: 'college1', name: 'Demo College', shortName: 'DC' },
      createdAt: new Date()
    }
  ]
  
  // Find user by email
  const user = demoUsers.find(u => u.email === email)
  
  if (!user || password !== 'password') {
    return NextResponse.json({
      success: false,
      message: 'Invalid credentials'
    }, { status: 401 })
  }
  
  // Simulate backend sendTokenResponse function
  return NextResponse.json({
    success: true,
    token: `demo-jwt-token-${user._id}`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college
    }
  })
}
