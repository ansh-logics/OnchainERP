import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // For development/demo purposes, we'll simulate the backend API call
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    
    const authHeader = request.headers.get('Authorization')
    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    const response = await fetch(`${backendUrl}/api/admin/reports/grades?${searchParams}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || '',
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Grade report API error:', error)
    
    // For demo purposes, return mock grade data
    return NextResponse.json({
      success: true,
      count: 3,
      data: [
        {
          studentId: '1',
          enrollmentNumber: 'CS2021001',
          name: 'John Doe',
          email: 'john.doe@example.com',
          courses: {
            'CS101': {
              courseName: 'Introduction to Computer Science',
              assignments: [
                { assignment: 'Assignment 1', score: 85, maxScore: 100, percentage: 85, gradedBy: 'Dr. Smith' },
                { assignment: 'Midterm Exam', score: 92, maxScore: 100, percentage: 92, gradedBy: 'Dr. Smith' },
                { assignment: 'Final Project', score: 88, maxScore: 100, percentage: 88, gradedBy: 'Dr. Smith' }
              ],
              averageScore: 265,
              totalMaxScore: 300,
              averagePercentage: 88.33
            },
            'MATH201': {
              courseName: 'Calculus II',
              assignments: [
                { assignment: 'Quiz 1', score: 78, maxScore: 100, percentage: 78, gradedBy: 'Dr. Johnson' },
                { assignment: 'Midterm Exam', score: 82, maxScore: 100, percentage: 82, gradedBy: 'Dr. Johnson' }
              ],
              averageScore: 160,
              totalMaxScore: 200,
              averagePercentage: 80
            }
          }
        },
        {
          studentId: '2',
          enrollmentNumber: 'CS2021002',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          courses: {
            'CS101': {
              courseName: 'Introduction to Computer Science',
              assignments: [
                { assignment: 'Assignment 1', score: 95, maxScore: 100, percentage: 95, gradedBy: 'Dr. Smith' },
                { assignment: 'Midterm Exam', score: 89, maxScore: 100, percentage: 89, gradedBy: 'Dr. Smith' }
              ],
              averageScore: 184,
              totalMaxScore: 200,
              averagePercentage: 92
            }
          }
        },
        {
          studentId: '3',
          enrollmentNumber: 'CS2021003',
          name: 'Bob Wilson',
          email: 'bob.wilson@example.com',
          courses: {
            'MATH201': {
              courseName: 'Calculus II',
              assignments: [
                { assignment: 'Quiz 1', score: 72, maxScore: 100, percentage: 72, gradedBy: 'Dr. Johnson' },
                { assignment: 'Midterm Exam', score: 85, maxScore: 100, percentage: 85, gradedBy: 'Dr. Johnson' },
                { assignment: 'Final Exam', score: 79, maxScore: 100, percentage: 79, gradedBy: 'Dr. Johnson' }
              ],
              averageScore: 236,
              totalMaxScore: 300,
              averagePercentage: 78.67
            }
          }
        }
      ]
    })
  }
}
