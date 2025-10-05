import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');

    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[API] Checking student status');

    const response = await fetch(`${BACKEND_URL}/api/student-services/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
    });

    const data = await response.json();
    console.log('[API] Student profile response:', data);

    if (!response.ok) {
      console.error('[API] Student profile error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      return NextResponse.json({
        success: false,
        message: data.message || data.error || 'Failed to get student profile',
        details: data
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Student status check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
