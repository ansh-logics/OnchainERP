import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

// Mock assignments data
const mockAssignmentsData = {
  success: true,
  data: {
    assignments: [
      {
        id: '1',
        title: 'Binary Search Tree Implementation',
        course: 'Data Structures & Algorithms',
        courseCode: 'CS301',
        dueDate: '2025-01-25',
        status: 'pending',
        description: 'Implement a complete BST with insertion, deletion, and traversal operations',
        totalMarks: 100,
        type: 'Programming',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Database Design Project',
        course: 'Database Management Systems',
        courseCode: 'CS302',
        dueDate: '2025-01-28',
        status: 'submitted',
        description: 'Design a complete database schema for a library management system',
        totalMarks: 100,
        obtainedMarks: 92,
        type: 'Project',
        priority: 'medium',
        submittedDate: '2025-01-26'
      },
      {
        id: '3',
        title: 'Socket Programming Lab',
        course: 'Computer Networks',
        courseCode: 'CS303',
        dueDate: '2025-02-02',
        status: 'pending',
        description: 'Create a client-server application using TCP sockets',
        totalMarks: 50,
        type: 'Lab',
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Process Scheduling Algorithms',
        course: 'Operating Systems',
        courseCode: 'CS304',
        dueDate: '2025-01-30',
        status: 'graded',
        description: 'Implement and compare FCFS, SJF, and Round Robin scheduling',
        totalMarks: 75,
        obtainedMarks: 68,
        type: 'Programming',
        priority: 'medium',
        submittedDate: '2025-01-28',
        gradedDate: '2025-01-29'
      }
    ],
    summary: {
      total: 4,
      pending: 2,
      submitted: 1,
      graded: 1,
      averageScore: 80.0
    }
  }
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/student-services/assignments/my${queryString ? `?${queryString}` : ''}`, {
        method: 'GET',
        headers: {
          'Authorization': request.headers.get('authorization') || '',
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        return NextResponse.json(data, { status: response.status });
      }
      
      // Backend failed, return mock data
      console.log('[API] Backend failed, using mock assignments data');
      return NextResponse.json(mockAssignmentsData);
    } catch (fetchError) {
      // Backend not reachable, return mock data
      console.log('[API] Backend not reachable, using mock assignments data');
      return NextResponse.json(mockAssignmentsData);
    }
  } catch (error) {
    console.error('Get student assignments API error:', error);
    // Return mock data even on error
    return NextResponse.json(mockAssignmentsData);
  }
}
