import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    
    const response = await fetch(`${backendUrl}/api/faculty`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Faculty API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'No token provided'
      }, { status: 401 })
    }

    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    
    // Faculty creation endpoint - we need to add this to backend
    const response = await fetch(`${backendUrl}/api/faculty`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Create faculty API error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}
