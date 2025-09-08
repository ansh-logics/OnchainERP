# OnchainERP Complete API Testing Guide

This document provides a comprehensive testing guide for the OnchainERP API, covering the complete flow from college registration to all user operations.

## Prerequisites

1. **Server Running**: Ensure the backend server is running on `http://localhost:5000`
2. **Database**: Both PostgreSQL and MongoDB should be connected and initialized
3. **Dependencies**: Make sure all required packages are installed
4. **jq**: Install jq for JSON parsing in bash scripts (`brew install jq` on macOS)

## Testing Flow Overview

The testing follows the actual business flow of the OnchainERP system:

1. **College Registration** (Public)
2. **Admin Setup and Login**
3. **Department Management**
4. **Course Management**
5. **Faculty Management**
6. **Student Management**
7. **Faculty Operations**
8. **Student Operations**
9. **Grading and Evaluation**
10. **Admin Reports and Analytics**
11. **Additional Features**
12. **Cleanup and Logout**

## Quick Start

### Option 1: Automated Script
```bash
# Run the complete automated test
./api_test_flow.sh
```

### Option 2: Manual Testing
Follow the individual curl commands below for step-by-step testing.

## Detailed Testing Steps

### Phase 1: College Registration

**Endpoint**: `POST /api/colleges/register` (Public)

```bash
curl -X POST http://localhost:5000/api/colleges/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Engineering College",
    "shortName": "TEC",
    "establishedYear": 2020,
    "affiliatedUniversity": "Test University",
    "collegeType": "Engineering",
    "addressStreet": "123 Test Street",
    "addressCity": "Test City",
    "addressState": "Test State",
    "addressPincode": "123456",
    "addressCountry": "India",
    "phone": "+91-9876543210",
    "email": "contact@testcollege.edu",
    "website": "https://testcollege.edu",
    "registrationNumber": "REG2024001",
    "naacGrade": "A",
    "campusArea": 50,
    "totalBuildings": 5,
    "totalClassrooms": 30,
    "totalLaboratories": 15,
    "libraryTotalBooks": 10000,
    "libraryDigitalResources": true,
    "libraryArea": 1000,
    "adminName": "John Admin",
    "adminEmail": "admin@testcollege.edu",
    "adminPassword": "admin123456",
    "adminPhone": "+91-9876543211",
    "academicStartMonth": 7,
    "academicEndMonth": 6
  }'
```

**Expected Response**: College creation with admin user details and college ID.

### Phase 2: Admin Authentication

**Endpoint**: `POST /api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testcollege.edu",
    "password": "admin123456"
  }'
```

**Expected Response**: JWT token for admin authentication.

### Phase 3: Admin Dashboard

**Endpoint**: `GET /api/admin/dashboard`

```bash
curl -X GET http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Phase 4: Department Management

**Create Department**: `POST /api/departments`

```bash
curl -X POST http://localhost:5000/api/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Computer Science",
    "code": "CS",
    "description": "Department of Computer Science and Engineering",
    "hodName": "Dr. Jane Smith",
    "hodEmail": "hod.cs@testcollege.edu",
    "hodPhone": "+91-9876543212",
    "establishedYear": 2020,
    "totalSeats": 120,
    "collegeId": "YOUR_COLLEGE_ID"
  }'
```

**Create Sections**: `POST /api/departments/{id}/sections`

```bash
curl -X POST http://localhost:5000/api/departments/DEPARTMENT_ID/sections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "sections": [
      {"name": "A", "capacity": 60, "year": 1},
      {"name": "B", "capacity": 60, "year": 1}
    ]
  }'
```

### Phase 5: Course Management

**Create Course**: `POST /api/courses`

```bash
curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Data Structures and Algorithms",
    "code": "CS101",
    "credits": 4,
    "description": "Introduction to Data Structures and Algorithms",
    "semester": 3,
    "year": 2,
    "courseType": "core",
    "departmentId": "YOUR_DEPARTMENT_ID"
  }'
```

### Phase 6: Faculty Management

**Create Faculty**: `POST /api/faculty`

```bash
curl -X POST http://localhost:5000/api/faculty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Dr. Alice Johnson",
    "email": "alice.johnson@testcollege.edu",
    "password": "faculty123456",
    "phone": "+91-9876543213",
    "designation": "Assistant Professor",
    "qualification": "PhD in Computer Science",
    "experience": 5,
    "specialization": "Data Structures, Algorithms",
    "departmentId": "YOUR_DEPARTMENT_ID"
  }'
```

**Faculty Login**: `POST /api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.johnson@testcollege.edu",
    "password": "faculty123456"
  }'
```

### Phase 7: Student Management

**Create Student**: `POST /api/students`

```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Bob Student",
    "email": "bob.student@testcollege.edu",
    "password": "student123456",
    "phone": "+91-9876543214",
    "dateOfBirth": "2002-05-15",
    "gender": "Male",
    "address": "456 Student Street, Test City",
    "guardianName": "Robert Parent",
    "guardianPhone": "+91-9876543215",
    "departmentId": "YOUR_DEPARTMENT_ID",
    "year": 2,
    "section": "A",
    "admissionYear": 2023,
    "admissionNumber": "ADM2023001"
  }'
```

**Register Student for Course**: `POST /api/students/{id}/courses/{courseId}`

```bash
curl -X POST http://localhost:5000/api/students/STUDENT_ID/courses/COURSE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{}'
```

**Student Login**: `POST /api/auth/login`

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob.student@testcollege.edu",
    "password": "student123456"
  }'
```

### Phase 8: Faculty Operations

**Create Assignment**: `POST /api/faculty/{id}/courses/{courseId}/assignments`

```bash
curl -X POST http://localhost:5000/api/faculty/FACULTY_ID/courses/COURSE_ID/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FACULTY_TOKEN" \
  -d '{
    "title": "Data Structures Implementation",
    "description": "Implement basic data structures in your preferred programming language",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "maxMarks": 100,
    "instructions": "Submit well-documented code with test cases"
  }'
```

**Mark Attendance**: `POST /api/faculty/{id}/courses/{courseId}/attendance`

```bash
curl -X POST http://localhost:5000/api/faculty/FACULTY_ID/courses/COURSE_ID/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FACULTY_TOKEN" \
  -d '{
    "date": "2024-09-08",
    "attendanceData": [
      {
        "studentId": "STUDENT_ID",
        "status": "present"
      }
    ]
  }'
```

### Phase 9: Student Operations

**Submit Assignment**: `POST /api/students/{id}/assignments/{assignmentId}`

```bash
curl -X POST http://localhost:5000/api/students/STUDENT_ID/assignments/ASSIGNMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -d '{
    "submissionText": "Here is my implementation of data structures including arrays, linked lists, stacks, and queues.",
    "notes": "All code is tested and documented"
  }'
```

**Get Student Dashboard**: `GET /api/students/{id}/dashboard`

```bash
curl -X GET http://localhost:5000/api/students/STUDENT_ID/dashboard \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### Phase 10: Grading

**Grade Assignment**: `POST /api/faculty/{id}/students/{studentId}/assignments/{assignmentId}/grade`

```bash
curl -X POST http://localhost:5000/api/faculty/FACULTY_ID/students/STUDENT_ID/assignments/ASSIGNMENT_ID/grade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FACULTY_TOKEN" \
  -d '{
    "marks": 85,
    "feedback": "Good implementation with proper documentation. Consider optimizing the search algorithms.",
    "gradedAt": "2024-09-08T12:00:00.000Z"
  }'
```

### Phase 11: Reports and Analytics

**Attendance Report**: `GET /api/admin/reports/attendance`

```bash
curl -X GET "http://localhost:5000/api/admin/reports/attendance?startDate=2024-09-01&endDate=2024-09-30" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Grade Report**: `GET /api/admin/reports/grades`

```bash
curl -X GET "http://localhost:5000/api/admin/reports/grades?semester=3" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

## Testing Checklist

### ✅ Core Features
- [ ] College Registration (Public)
- [ ] Admin Authentication
- [ ] Department Management
- [ ] Course Management
- [ ] Faculty Management
- [ ] Student Management
- [ ] Assignment System
- [ ] Attendance System
- [ ] Grading System
- [ ] Reports & Analytics

### ✅ User Roles
- [ ] Admin Operations
- [ ] Faculty Operations
- [ ] Student Operations
- [ ] Role-based Access Control

### ✅ Security
- [ ] JWT Authentication
- [ ] Authorization Middleware
- [ ] Protected Routes
- [ ] Password Hashing

### ✅ Data Flow
- [ ] College → Admin → Department → Course → Faculty → Student
- [ ] Assignment Creation → Submission → Grading
- [ ] Attendance Marking → Reporting
- [ ] User Registration → Login → Operations

## Expected Business Flow

1. **College Registration**: A new college registers with basic information and admin details
2. **Admin Setup**: The college admin logs in and sets up the college infrastructure
3. **Department Creation**: Admin creates academic departments
4. **Course Management**: Admin adds courses to departments
5. **Faculty Onboarding**: Admin creates faculty accounts and assigns them to departments
6. **Student Enrollment**: Admin enrolls students and assigns them to departments and courses
7. **Academic Operations**: Faculty creates assignments, marks attendance, and grades students
8. **Student Activities**: Students submit assignments and view their academic progress
9. **Reporting**: Admin generates reports and analytics for institutional management

## Error Scenarios to Test

1. **Authentication Errors**:
   - Invalid credentials
   - Expired tokens
   - Unauthorized access

2. **Validation Errors**:
   - Missing required fields
   - Invalid data formats
   - Duplicate entries

3. **Business Logic Errors**:
   - Creating department without college
   - Assigning non-existent courses
   - Invalid role assignments

## Performance Considerations

- Test with multiple concurrent users
- Verify database query performance
- Check API response times
- Monitor memory usage during bulk operations

## Notes

- Replace placeholder IDs (YOUR_COLLEGE_ID, STUDENT_ID, etc.) with actual IDs from responses
- Save tokens from login responses for subsequent requests
- Check response status codes and error messages
- Verify data persistence in database
- Test all user role permissions

## Troubleshooting

If tests fail:
1. Check server is running on correct port
2. Verify database connections
3. Check environment variables
4. Review API endpoint URLs
5. Validate request payload format
6. Check authentication tokens
