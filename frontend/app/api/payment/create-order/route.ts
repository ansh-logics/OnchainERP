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

    console.log('[API] Creating payment order:', body);

    const response = await fetch(`${BACKEND_URL}/api/student-services/create-payment-order`, {
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
      // Log more details for debugging
      console.error('[API] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        data: data
      });
      
      // Return a more descriptive error message
      return NextResponse.json({
        success: false,
        message: data.message || data.error || 'Failed to create payment order',
        details: data
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Payment order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
