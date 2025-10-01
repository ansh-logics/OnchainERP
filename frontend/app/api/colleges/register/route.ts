import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let body;
    try {
      body = await request.json();
      console.log('Request body received:', body);
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate required fields
    const requiredFields = ['name', 'shortName', 'establishedYear', 'collegeType', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Forward the request to your backend API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';
    console.log('Forwarding to backend:', `${backendUrl}/api/colleges/register`);
    
    const response = await fetch(`${backendUrl}/api/colleges/register`, {
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
      return NextResponse.json(
        { success: false, message: 'Backend server error' },
        { status: response.status }
      );
    }

    let data;
    try {
      data = await response.json();
      console.log('Backend response data:', data);
    } catch (jsonError) {
      console.error('Failed to parse backend response JSON:', jsonError);
      return NextResponse.json(
        { success: false, message: 'Invalid response from backend' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
