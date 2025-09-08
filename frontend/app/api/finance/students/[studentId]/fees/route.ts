import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// GET /api/finance/students/:studentId/fees
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const token = request.headers.get('authorization')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      )
    }

    const queryString = searchParams.toString()
    const url = `${BACKEND_URL}/api/finance/students/${params.studentId}/fees${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Student fees fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
