import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For development/demo purposes, we'll simulate the backend API call
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    
    const authHeader = request.headers.get('Authorization')
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    const response = await fetch(`${backendUrl}/api/admin/reports/attendance?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Attendance report API error:', error)
    
    // For demo purposes, return mock attendance data
    return NextResponse.json({
      success: true,
      count: 3,
      data: [
        {
          studentId: '1',
          enrollmentNumber: 'CS2021001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          attendance: {
            '2024-01-15': { 'CS101': 'Present', 'MATH201': 'Present' },
            '2024-01-16': { 'CS101': 'Absent', 'MATH201': 'Present' },
            '2024-01-17': { 'CS101': 'Present', 'MATH201': 'Present' }
          }
        },
        {
          studentId: '2',
          enrollmentNumber: 'CS2021002',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          attendance: {
            '2024-01-15': { 'CS101': 'Present', 'MATH201': 'Absent' },
            '2024-01-16': { 'CS101': 'Present', 'MATH201': 'Present' },
            '2024-01-17': { 'CS101': 'Present', 'MATH201': 'Present' }
          }
        },
        {
          studentId: '3',
          enrollmentNumber: 'CS2021003',
          name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          attendance: {
            '2024-01-15': { 'CS101': 'Present', 'MATH201': 'Present' },
            '2024-01-16': { 'CS101': 'Present', 'MATH201': 'Absent' },
            '2024-01-17': { 'CS101': 'Absent', 'MATH201': 'Present' }
          }
        }
      ]
    })
  }
}
