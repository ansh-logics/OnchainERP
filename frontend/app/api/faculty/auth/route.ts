import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

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

    console.log('[API] Faculty authentication request:', { action: body.action });

    // Forward to backend faculty auth endpoint
    const response = await fetch(`${BACKEND_URL}/api/faculty-services/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorization,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    console.log('[API] Backend response:', data);

    if (!response.ok) {
      console.error('[API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      return NextResponse.json({
        success: false,
        message: data.message || data.error || 'Faculty authentication failed',
        details: data
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Faculty authentication error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
