import { NextRequest, NextResponse } from 'next/server';

// Mock realistic faculty profile data
const mockProfileData = {
  success: true,
  data: {
    personalInfo: {
      id: 'faculty_67831',
      name: 'Dr. Rajesh Kumar',
      email: 'rajesh.kumar@college.edu',
      phone: '+91 98765 43210',
      alternateEmail: 'rajesh.research@gmail.com',
      profilePicture: '/uploads/profile/faculty_67831.jpg',
      dateOfBirth: '1985-03-15',
      gender: 'Male',
      bloodGroup: 'B+',
      nationality: 'Indian',
      maritalStatus: 'Married'
    },
    professionalInfo: {
      employeeId: 'FAC2023001',
      designation: 'Associate Professor',
      department: {
        id: 'dept_cs_001',
        name: 'Computer Science & Engineering',
        code: 'CSE'
      },
      college: {
        id: 'college_001',
        name: 'Dr. A.P.J. Abdul Kalam Technical University',
        shortName: 'AKTU'
      },
      joiningDate: '2018-07-15',
      experience: {
        totalYears: 12,
        industryYears: 4,
        academicYears: 8,
        currentInstitution: 6
      },
      employmentType: 'Permanent',
      salary: {
        basic: 75000,
        allowances: 25000,
        total: 100000,
        currency: 'INR'
      }
    },
    academicInfo: {
      qualifications: [
        {
          degree: 'Ph.D.',
          field: 'Computer Science',
          university: 'Indian Institute of Technology, Delhi',
          year: 2016,
          grade: 'First Class',
          specialization: 'Machine Learning and Data Mining'
        },
        {
          degree: 'M.Tech',
          field: 'Computer Science & Engineering',
          university: 'National Institute of Technology, Kurukshetra',
          year: 2012,
          grade: 'First Class with Distinction',
          specialization: 'Software Engineering'
        },
        {
          degree: 'B.Tech',
          field: 'Computer Science & Engineering',
          university: 'Guru Gobind Singh Indraprastha University',
          year: 2010,
          grade: 'First Class',
          specialization: 'Computer Science'
        }
      ],
      specializations: [
        'Machine Learning',
        'Data Mining',
        'Algorithms',
        'Database Systems',
        'Software Engineering'
      ],
      researchAreas: [
        'Artificial Intelligence',
        'Big Data Analytics',
        'Deep Learning',
        'Natural Language Processing'
      ],
      publications: {
        journals: 18,
        conferences: 12,
        bookChapters: 3,
        patents: 2,
        hIndex: 15,
        totalCitations: 456
      }
    },
    addressInfo: {
      current: {
        street: '42, Green Valley Apartments',
        city: 'Ghaziabad',
        state: 'Uttar Pradesh',
        pincode: '201001',
        country: 'India'
      },
      permanent: {
        street: 'House No. 123, Sector 15',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        country: 'India'
      }
    },
    emergencyContact: {
      name: 'Priya Kumar',
      relationship: 'Spouse',
      phone: '+91 98765 43211',
      email: 'priya.kumar@email.com',
      address: '42, Green Valley Apartments, Ghaziabad, UP - 201001'
    },
    bankDetails: {
      accountNumber: '****7890',
      bankName: 'State Bank of India',
      branchName: 'Ghaziabad Main Branch',
      ifscCode: 'SBIN0001234',
      panNumber: 'ABCDE1234F'
    },
    currentAssignments: {
      courses: 4,
      sections: 6,
      totalStudents: 184,
      adminRoles: [
        'Head of Examination Committee',
        'Member - Academic Council',
        'Coordinator - Industry Interface Cell'
      ],
      committees: [
        'Faculty Selection Committee',
        'Research & Development Committee',
        'Student Grievance Committee'
      ]
    },
    achievements: [
      {
        title: 'Best Faculty Award',
        year: 2023,
        organization: 'College Excellence Awards',
        description: 'Recognized for outstanding teaching and research contributions'
      },
      {
        title: 'Research Excellence Grant',
        year: 2022,
        organization: 'AICTE',
        description: 'Received ₹5,00,000 grant for AI research project'
      },
      {
        title: 'Outstanding Paper Award',
        year: 2021,
        organization: 'IEEE International Conference',
        description: 'Best paper award for Machine Learning research'
      }
    ],
    recentProjects: [
      {
        id: 'proj_001',
        title: 'Smart Campus Management System using IoT',
        status: 'Ongoing',
        startDate: '2023-01-15',
        expectedEndDate: '2024-12-31',
        fundingAgency: 'DST',
        amount: 850000,
        role: 'Principal Investigator'
      },
      {
        id: 'proj_002',
        title: 'AI-based Student Performance Prediction',
        status: 'Completed',
        startDate: '2022-06-01',
        endDate: '2023-05-31',
        fundingAgency: 'UGC',
        amount: 350000,
        role: 'Co-Investigator'
      }
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[API] Fetching faculty profile data');

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 600));

    return NextResponse.json(mockProfileData);
  } catch (error) {
    console.error('[API] Faculty profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authorization = request.headers.get('authorization');
    const body = await request.json();
    
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: 'Authorization header required' },
        { status: 401 }
      );
    }

    console.log('[API] Updating faculty profile:', body);

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    // Return updated profile data
    const updatedProfile = {
      ...mockProfileData,
      data: {
        ...mockProfileData.data,
        ...body
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile.data
    });
  } catch (error) {
    console.error('[API] Update faculty profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
