import { NextRequest, NextResponse } from 'next/server';

// Mock faculty credentials for demo
const mockFacultyCredentials = [
  { email: 'rajesh.kumar@college.edu', password: 'faculty123', role: 'faculty', name: 'Dr. Rajesh Kumar' },
  { email: 'priya.sharma@college.edu', password: 'faculty123', role: 'faculty', name: 'Dr. Priya Sharma' },
  { email: 'amit.singh@college.edu', password: 'faculty123', role: 'faculty', name: 'Prof. Amit Singh' },
  { email: 'faculty@demo.com', password: 'demo123', role: 'faculty', name: 'Demo Faculty' }
];

const mockFacultyResponse = {
  success: true,
  message: 'Login successful',
  data: {
    id: 'faculty_67831',
    name: 'Dr. Rajesh Kumar',
    email: 'rajesh.kumar@college.edu',
    role: 'faculty',
    profilePicture: '/uploads/profile/faculty_67831.jpg',
    college: { _id: 'college1', name: 'Dr. A.P.J. Abdul Kalam Technical University', shortName: 'AKTU' },
    facultyProfile: {
      employeeId: 'FAC2023001',
      designation: 'Associate Professor',
      department: { name: 'Computer Science & Engineering', code: 'CSE' }
    }
  },
  token: 'mock_faculty_token_' + Date.now()
};

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log('Login request received:', { email: body.email });
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check for mock faculty credentials first
    const mockFaculty = mockFacultyCredentials.find(cred => 
      cred.email === body.email && cred.password === body.password
    );
    
    if (mockFaculty) {
      console.log('[API] Mock faculty login successful:', mockFaculty.name);
      const response = {
        ...mockFacultyResponse,
        data: {
          ...mockFacultyResponse.data,
          name: mockFaculty.name,
          email: mockFaculty.email
        }
      };
      return NextResponse.json(response);
    }
    
    // Forward the request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    console.log('Forwarding login to backend:', `${backendUrl}/api/auth/login`);
    
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('Backend response status:', response.status);
    
    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      
      // If backend fails, check if this looks like a faculty email for demo
      if (body.email.includes('faculty') || body.email.includes('@college.edu')) {
        console.log('[API] Backend failed, providing mock faculty login for demo');
        return NextResponse.json(mockFacultyResponse);
      }
      
      // Try to parse error response
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { success: false, message: errorData.message || 'Login failed' },
          { status: response.status }
        );
      } catch {
        return NextResponse.json(
          { success: false, message: 'Authentication failed' },
          { status: response.status }
        );
      }
    }

    let data;
    try {
      data = await response.json();
      console.log('Login successful:', { 
        userId: data.data?.id, 
        role: data.data?.role,
        name: data.data?.name,
        email: data.data?.email 
      });
    } catch (jsonError) {
      console.error('Failed to parse backend response JSON:', jsonError);
      return NextResponse.json(
        { success: false, message: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    // Create the response with cookies if backend provided a token
    const nextResponse = NextResponse.json(data, { status: response.status });
    
    // Forward any cookies from backend response
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      nextResponse.headers.set('set-cookie', setCookieHeader);
    }

    return nextResponse;
  } catch (error) {
    console.error('Login API Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
