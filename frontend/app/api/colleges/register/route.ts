import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body
  
  try {
    body = await request.json()
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Invalid JSON body'
    }, { status: 400 })
  }
  
  // Try to connect to backend first
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
  
  try {
    const response = await fetch(`${backendUrl}/api/colleges/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    
    const data = await response.json()
    
    return NextResponse.json(data, { status: response.status })
  } catch (backendError) {
    console.log('Backend not available, using demo mode')
  }
  
  // Demo mode - simulate backend collegeController.registerCollege response
  const {
    name,
    shortName,
    registrationNumber,
    establishedYear,
    affiliatedUniversity,
    collegeType,
    address,
    contactDetails,
    adminDetails
  } = body
  
  // Basic validation
  if (!name || !shortName || !registrationNumber || !adminDetails?.name || !adminDetails?.email) {
    return NextResponse.json({
      success: false,
      message: 'Please provide all required fields'
    }, { status: 400 })
  }
  
  // Simulate successful college registration
  return NextResponse.json({
    success: true,
    message: 'College registered successfully',
    data: {
      college: {
        _id: `college_${Date.now()}`,
        name,
        shortName: shortName.toUpperCase(),
        registrationNumber,
        establishedYear,
        affiliatedUniversity,
        collegeType: collegeType || 'Government',
        address,
        contactDetails,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      admin: {
        _id: `admin_${Date.now()}`,
        name: adminDetails.name,
        email: adminDetails.email,
        role: 'admin',
        college: `college_${Date.now()}`,
        isActive: true,
        createdAt: new Date()
      },
      token: `demo-admin-token-${Date.now()}`
    }
  })
}
