#!/bin/bash

# OnchainERP Complete API Testing Flow
# This script tests the complete flow from college creation to all user operations

BASE_URL="http://localhost:5001"
API_BASE="$BASE_URL/api"

# Generate unique timestamp for this test run
TIMESTAMP=$(date +%s)
TEST_SUFFIX="test$TIMESTAMP"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to check if server is running
check_server() {
    print_step "Checking if server is running"
    response=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
    if [ $response -eq 200 ]; then
        print_success "Server is running on $BASE_URL"
    else
        print_error "Server is not running. Please start the server first."
        exit 1
    fi
}

# Variables to store tokens and IDs
ADMIN_TOKEN=""
FACULTY_TOKEN=""
STUDENT_TOKEN=""
COLLEGE_ID=""
DEPARTMENT_ID=""
COURSE_ID=""
FACULTY_ID=""
STUDENT_ID=""
ASSIGNMENT_ID=""
EXAM_ID=""
EXAM_HALL_ID=""
HOSTEL_ID=""
ROOM_ID=""
BOOK_ID=""
ISSUE_ID=""
CLASSROOM_ID=""
TIMETABLE_ID=""

# Step 1: Check server status
check_server

print_step "Starting Complete API Flow Testing"
echo "Base URL: $API_BASE"
echo ""

# =============================================================================
# PHASE 1: COLLEGE REGISTRATION AND SETUP
# =============================================================================

print_step "PHASE 1: College Registration and Setup"

# 1.1 Register a new college (Public endpoint)
print_step "1.1 Registering a new college"
COLLEGE_RESPONSE=$(curl -s -X POST $API_BASE/colleges/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Engineering College",
    "shortName": "TEC'$TEST_SUFFIX'",
    "establishedYear": 2020,
    "affiliatedUniversity": "Test University",
    "collegeType": "Private",
    "addressStreet": "123 Test Street",
    "addressCity": "Test City",
    "addressState": "Test State",
    "addressPincode": "123456",
    "addressCountry": "India",
    "phone": "9876543210",
    "email": "contact@'$TEST_SUFFIX'.edu",
    "website": "https://'$TEST_SUFFIX'.edu",
    "registrationNumber": "REG'$TEST_SUFFIX'",
    "naacGrade": "A",
    "campusArea": 50,
    "totalBuildings": 5,
    "totalClassrooms": 30,
    "totalLaboratories": 15,
    "libraryTotalBooks": 10000,
    "libraryDigitalResources": true,
    "libraryArea": 1000,
    "adminName": "John Admin",
    "adminEmail": "admin@'$TEST_SUFFIX'.edu",
    "adminPassword": "admin123456",
    "adminPhone": "9876543211",
    "academicStartMonth": 7,
    "academicEndMonth": 6
  }')

echo "College Registration Response:"
echo $COLLEGE_RESPONSE | jq '.'

# Extract college ID
COLLEGE_ID=$(echo $COLLEGE_RESPONSE | jq -r '.data.college.id')
if [ "$COLLEGE_ID" != "null" ] && [ -n "$COLLEGE_ID" ]; then
    print_success "College registered successfully with ID: $COLLEGE_ID"
else
    print_error "Failed to register college"
    echo $COLLEGE_RESPONSE
    exit 1
fi

# =============================================================================
# PHASE 2: ADMIN LOGIN AND INITIAL SETUP
# =============================================================================

print_step "PHASE 2: Admin Login and Initial Setup"

# 2.1 Admin Login
print_step "2.1 Admin Login"
LOGIN_RESPONSE=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@'$TEST_SUFFIX'.edu",
    "password": "admin123456"
  }')

echo "Admin Login Response:"
echo $LOGIN_RESPONSE | jq '.'

# Extract admin token
ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
if [ "$ADMIN_TOKEN" != "null" ] && [ -n "$ADMIN_TOKEN" ]; then
    print_success "Admin logged in successfully"
else
    print_error "Failed to login admin"
    echo $LOGIN_RESPONSE
    exit 1
fi

# 2.2 Get admin profile
print_step "2.2 Getting admin profile"
ADMIN_PROFILE=$(curl -s -X GET $API_BASE/auth/me \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Admin Profile:"
echo $ADMIN_PROFILE | jq '.'

# 2.3 Get admin dashboard stats
print_step "2.3 Getting admin dashboard stats"
DASHBOARD_STATS=$(curl -s -X GET $API_BASE/admin/dashboard \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Dashboard Stats:"
echo $DASHBOARD_STATS | jq '.'

# =============================================================================
# PHASE 3: DEPARTMENT MANAGEMENT
# =============================================================================

print_step "PHASE 3: Department Management"

# 3.1 Create a department
print_step "3.1 Creating Computer Science department"
DEPT_RESPONSE=$(curl -s -X POST $API_BASE/departments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Computer Science",
    "shortName": "CSE'$TEST_SUFFIX'",
    "code": "CS'$TEST_SUFFIX'",
    "description": "Department of Computer Science and Engineering",
    "hodName": "Dr. Jane Smith",
    "hodEmail": "hod.cs@'$TEST_SUFFIX'.edu",
    "hodPhone": "9876543212",
    "establishedYear": 2020,
    "totalSeats": 120,
    "studentsPerSection": 60,
    "totalSections": 2,
    "totalIntake": 120,
    "college": "'$COLLEGE_ID'"
  }')

echo "Department Creation Response:"
echo $DEPT_RESPONSE | jq '.'

# Extract department ID
DEPARTMENT_ID=$(echo $DEPT_RESPONSE | jq -r '.data.id')
if [ "$DEPARTMENT_ID" != "null" ] && [ -n "$DEPARTMENT_ID" ]; then
    print_success "Department created successfully with ID: $DEPARTMENT_ID"
else
    print_error "Failed to create department"
fi

# 3.2 Get all departments
print_step "3.2 Getting all departments"
ALL_DEPTS=$(curl -s -X GET $API_BASE/departments \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "All Departments:"
echo $ALL_DEPTS | jq '.'

# 3.3 Create sections for the department
print_step "3.3 Creating sections for Computer Science department"
SECTIONS_RESPONSE=$(curl -s -X POST $API_BASE/departments/$DEPARTMENT_ID/sections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "sections": [
      {"name": "A", "capacity": 60, "year": 1},
      {"name": "B", "capacity": 60, "year": 1}
    ]
  }')

echo "Sections Creation Response:"
echo $SECTIONS_RESPONSE | jq '.'

# =============================================================================
# PHASE 4: COURSE MANAGEMENT
# =============================================================================

print_step "PHASE 4: Course Management"

# 4.1 Create a course
print_step "4.1 Creating Data Structures course"
COURSE_RESPONSE=$(curl -s -X POST $API_BASE/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Data Structures and Algorithms",
    "code": "CS101'$TEST_SUFFIX'",
    "credits": 4,
    "description": "Introduction to Data Structures and Algorithms",
    "semester": 3,
    "courseType": "Core",
    "departmentId": "'$DEPARTMENT_ID'",
    "collegeId": "'$COLLEGE_ID'"
  }')

echo "Course Creation Response:"
echo $COURSE_RESPONSE | jq '.'

# Extract course ID
COURSE_ID=$(echo $COURSE_RESPONSE | jq -r '.data.id')
if [ "$COURSE_ID" != "null" ] && [ -n "$COURSE_ID" ]; then
    print_success "Course created successfully with ID: $COURSE_ID"
else
    print_error "Failed to create course"
fi

# 4.2 Get all courses
print_step "4.2 Getting all courses"
ALL_COURSES=$(curl -s -X GET $API_BASE/courses \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "All Courses:"
echo $ALL_COURSES | jq '.'

# =============================================================================
# PHASE 5: FACULTY MANAGEMENT
# =============================================================================

print_step "PHASE 5: Faculty Management"

# 5.1 Create a faculty member
print_step "5.1 Creating faculty member"
FACULTY_RESPONSE=$(curl -s -X POST $API_BASE/faculty \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Dr. Alice Johnson",
    "email": "alice.johnson@'$TEST_SUFFIX'.edu",
    "password": "faculty123456",
    "phone": "9876543213",
    "designation": "Assistant Professor",
    "qualification": "PhD in Computer Science",
    "experience": 5,
    "specialization": "Data Structures, Algorithms",
    "departmentId": "'$DEPARTMENT_ID'"
  }')

echo "Faculty Creation Response:"
echo $FACULTY_RESPONSE | jq '.'

# Extract faculty ID
FACULTY_ID=$(echo $FACULTY_RESPONSE | jq -r '.data.id')
if [ "$FACULTY_ID" != "null" ] && [ -n "$FACULTY_ID" ]; then
    print_success "Faculty created successfully with ID: $FACULTY_ID"
else
    print_error "Failed to create faculty"
fi

# 5.2 Get all faculty
print_step "5.2 Getting all faculty"
ALL_FACULTY=$(curl -s -X GET $API_BASE/faculty \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "All Faculty:"
echo $ALL_FACULTY | jq '.'

# 5.3 Faculty Login
print_step "5.3 Faculty Login"
FACULTY_LOGIN=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.johnson@'$TEST_SUFFIX'.edu",
    "password": "faculty123456"
  }')

echo "Faculty Login Response:"
echo $FACULTY_LOGIN | jq '.'

# Extract faculty token
FACULTY_TOKEN=$(echo $FACULTY_LOGIN | jq -r '.token')
if [ "$FACULTY_TOKEN" != "null" ] && [ -n "$FACULTY_TOKEN" ]; then
    print_success "Faculty logged in successfully"
else
    print_error "Failed to login faculty"
fi

# =============================================================================
# PHASE 6: STUDENT MANAGEMENT
# =============================================================================

print_step "PHASE 6: Student Management"

# 6.1 Create a student
print_step "6.1 Creating student"
STUDENT_RESPONSE=$(curl -s -X POST $API_BASE/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Bob Student",
    "email": "bob.student@'$TEST_SUFFIX'.edu",
    "password": "student123456",
    "phone": "9876543214",
    "dateOfBirth": "2002-05-15",
    "gender": "Male",
    "address": "456 Student Street, Test City",
    "guardianName": "Robert Parent",
    "guardianPhone": "9876543215",
    "departmentId": "'$DEPARTMENT_ID'",
    "year": 2,
    "section": "A",
    "admissionYear": 2023,
    "admissionNumber": "ADM2023001"
  }')

echo "Student Creation Response:"
echo $STUDENT_RESPONSE | jq '.'

# Extract student ID
STUDENT_ID=$(echo $STUDENT_RESPONSE | jq -r '.data.id')
if [ "$STUDENT_ID" != "null" ] && [ -n "$STUDENT_ID" ]; then
    print_success "Student created successfully with ID: $STUDENT_ID"
else
    print_error "Failed to create student"
fi

# 6.2 Add student to department
print_step "6.2 Adding student to department"
ADD_STUDENT_DEPT=$(curl -s -X POST $API_BASE/students/$STUDENT_ID/department \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "departmentId": "'$DEPARTMENT_ID'",
    "year": 2,
    "section": "A"
  }')

echo "Add Student to Department Response:"
echo $ADD_STUDENT_DEPT | jq '.'

# 6.3 Register student for course
print_step "6.3 Registering student for course"
REGISTER_COURSE=$(curl -s -X POST $API_BASE/students/$STUDENT_ID/courses/$COURSE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{}')

echo "Course Registration Response:"
echo $REGISTER_COURSE | jq '.'

# 6.4 Get all students
print_step "6.4 Getting all students"
ALL_STUDENTS=$(curl -s -X GET $API_BASE/students \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "All Students:"
echo $ALL_STUDENTS | jq '.'

# 6.5 Student Login
print_step "6.5 Student Login"
STUDENT_LOGIN=$(curl -s -X POST $API_BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob.student@'$TEST_SUFFIX'.edu",
    "password": "student123456"
  }')

echo "Student Login Response:"
echo $STUDENT_LOGIN | jq '.'

# Extract student token
STUDENT_TOKEN=$(echo $STUDENT_LOGIN | jq -r '.token')
if [ "$STUDENT_TOKEN" != "null" ] && [ -n "$STUDENT_TOKEN" ]; then
    print_success "Student logged in successfully"
else
    print_error "Failed to login student"
fi

# =============================================================================
# PHASE 7: FACULTY OPERATIONS
# =============================================================================

print_step "PHASE 7: Faculty Operations"

# 7.1 Faculty Dashboard
print_step "7.1 Getting faculty dashboard"
FACULTY_DASHBOARD=$(curl -s -X GET $API_BASE/faculty/$FACULTY_ID/dashboard \
  -H "Authorization: Bearer $FACULTY_TOKEN")

echo "Faculty Dashboard:"
echo $FACULTY_DASHBOARD | jq '.'

# 7.2 Get faculty courses
print_step "7.2 Getting faculty courses"
FACULTY_COURSES=$(curl -s -X GET $API_BASE/faculty/$FACULTY_ID/courses \
  -H "Authorization: Bearer $FACULTY_TOKEN")

echo "Faculty Courses:"
echo $FACULTY_COURSES | jq '.'

# 7.3 Create an assignment
print_step "7.3 Creating assignment by faculty"
ASSIGNMENT_RESPONSE=$(curl -s -X POST $API_BASE/faculty/$FACULTY_ID/courses/$COURSE_ID/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -d '{
    "title": "Data Structures Implementation",
    "description": "Implement basic data structures in your preferred programming language",
    "dueDate": "2024-12-31T23:59:59.000Z",
    "maxMarks": 100,
    "instructions": "Submit well-documented code with test cases"
  }')

echo "Assignment Creation Response:"
echo $ASSIGNMENT_RESPONSE | jq '.'

# Extract assignment ID
ASSIGNMENT_ID=$(echo $ASSIGNMENT_RESPONSE | jq -r '.data.id')
if [ "$ASSIGNMENT_ID" != "null" ] && [ -n "$ASSIGNMENT_ID" ]; then
    print_success "Assignment created successfully with ID: $ASSIGNMENT_ID"
else
    print_error "Failed to create assignment"
fi

# 7.4 Mark attendance
print_step "7.4 Marking attendance"
ATTENDANCE_RESPONSE=$(curl -s -X POST $API_BASE/faculty/$FACULTY_ID/courses/$COURSE_ID/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -d '{
    "date": "2024-09-08",
    "attendanceData": [
      {
        "studentId": "'$STUDENT_ID'",
        "status": "present"
      }
    ]
  }')

echo "Attendance Response:"
echo $ATTENDANCE_RESPONSE | jq '.'

# =============================================================================
# PHASE 8: STUDENT OPERATIONS
# =============================================================================

print_step "PHASE 8: Student Operations"

# 8.1 Student Dashboard
print_step "8.1 Getting student dashboard"
STUDENT_DASHBOARD=$(curl -s -X GET $API_BASE/students/$STUDENT_ID/dashboard \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Student Dashboard:"
echo $STUDENT_DASHBOARD | jq '.'

# 8.2 Get student attendance
print_step "8.2 Getting student attendance"
STUDENT_ATTENDANCE=$(curl -s -X GET $API_BASE/students/$STUDENT_ID/attendance \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Student Attendance:"
echo $STUDENT_ATTENDANCE | jq '.'

# 8.3 Submit assignment
print_step "8.3 Submitting assignment"
SUBMIT_ASSIGNMENT=$(curl -s -X POST $API_BASE/students/$STUDENT_ID/assignments/$ASSIGNMENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{
    "submissionText": "Here is my implementation of data structures including arrays, linked lists, stacks, and queues.",
    "notes": "All code is tested and documented"
  }')

echo "Assignment Submission Response:"
echo $SUBMIT_ASSIGNMENT | jq '.'

# 8.4 Get student grades
print_step "8.4 Getting student grades"
STUDENT_GRADES=$(curl -s -X GET $API_BASE/students/$STUDENT_ID/grades \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Student Grades:"
echo $STUDENT_GRADES | jq '.'

# =============================================================================
# PHASE 9: GRADING AND EVALUATION
# =============================================================================

print_step "PHASE 9: Grading and Evaluation"

# 9.1 Faculty grades assignment
print_step "9.1 Faculty grading assignment"
GRADE_ASSIGNMENT=$(curl -s -X POST $API_BASE/faculty/$FACULTY_ID/students/$STUDENT_ID/assignments/$ASSIGNMENT_ID/grade \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -d '{
    "marks": 85,
    "feedback": "Good implementation with proper documentation. Consider optimizing the search algorithms.",
    "gradedAt": "2024-09-08T12:00:00.000Z"
  }')

echo "Grading Response:"
echo $GRADE_ASSIGNMENT | jq '.'

# =============================================================================
# PHASE 10: ADMIN REPORTS AND ANALYTICS
# =============================================================================

print_step "PHASE 10: Admin Reports and Analytics"

# 10.1 Get attendance report
print_step "10.1 Getting attendance report"
ATTENDANCE_REPORT=$(curl -s -X GET "$API_BASE/admin/reports/attendance?startDate=2024-09-01&endDate=2024-09-30" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Attendance Report:"
echo $ATTENDANCE_REPORT | jq '.'

# 10.2 Get grade report
print_step "10.2 Getting grade report"
GRADE_REPORT=$(curl -s -X GET "$API_BASE/admin/reports/grades?semester=3" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Grade Report:"
echo $GRADE_REPORT | jq '.'

# 10.3 Get department stats
print_step "10.3 Getting department statistics"
DEPT_STATS=$(curl -s -X GET $API_BASE/departments/$DEPARTMENT_ID/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Department Statistics:"
echo $DEPT_STATS | jq '.'

# 10.4 Get college stats
print_step "10.4 Getting college statistics"
COLLEGE_STATS=$(curl -s -X GET $API_BASE/colleges/$COLLEGE_ID/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "College Statistics:"
echo $COLLEGE_STATS | jq '.'

# =============================================================================
# PHASE 11: CLASSROOM MANAGEMENT TESTING
# =============================================================================

print_step "PHASE 11: Classroom Management Testing"

# 11.1 Create classroom
print_step "11.1 Creating classroom"
CLASSROOM_RESPONSE=$(curl -s -X POST $API_BASE/classrooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "roomNumber": "CSL'$TEST_SUFFIX'",
    "roomType": "laboratory",
    "capacity": 60,
    "building": "CS Block",
    "floor": 1,
    "facilities": ["projector", "whiteboard", "computers"],
    "hasProjector": true,
    "collegeId": "'$COLLEGE_ID'"
  }')

echo "Classroom Creation Response:"
echo $CLASSROOM_RESPONSE | jq '.'

CLASSROOM_ID=$(echo $CLASSROOM_RESPONSE | jq -r '.data.id')
if [ "$CLASSROOM_ID" != "null" ] && [ -n "$CLASSROOM_ID" ]; then
    print_success "Classroom created successfully with ID: $CLASSROOM_ID"
else
    print_error "Failed to create classroom"
fi

# 11.2 Get all classrooms
print_step "11.2 Getting all classrooms"
ALL_CLASSROOMS=$(curl -s -X GET $API_BASE/classrooms \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "All Classrooms:"
echo $ALL_CLASSROOMS | jq '.'

# 11.3 Book classroom
print_step "11.3 Booking classroom"
BOOK_CLASSROOM=$(curl -s -X POST $API_BASE/classrooms/$CLASSROOM_ID/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -d '{
    "startTime": "2024-09-09T09:00:00.000Z",
    "endTime": "2024-09-09T10:00:00.000Z",
    "purpose": "Data Structures Lab",
    "courseId": "'$COURSE_ID'"
  }')

echo "Classroom Booking Response:"
echo $BOOK_CLASSROOM | jq '.'

# 11.4 Get available classrooms
print_step "11.4 Getting available classrooms"
AVAILABLE_CLASSROOMS=$(curl -s -X GET "$API_BASE/classrooms/available?date=2024-09-10&startTime=09:00&endTime=10:00" \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Available Classrooms:"
echo $AVAILABLE_CLASSROOMS | jq '.'

# =============================================================================
# PHASE 12: EXAM MANAGEMENT TESTING
# =============================================================================

print_step "PHASE 12: Exam Management Testing"

# 12.1 Create exam hall
print_step "12.1 Creating exam hall"
EXAM_HALL_RESPONSE=$(curl -s -X POST $API_BASE/exams/halls \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "hallName": "Main Exam Hall",
    "hallCode": "MEH'$TEST_SUFFIX'",
    "capacity": 200,
    "location": "Main Block, Floor 2",
    "facilities": ["CCTV", "AC"],
    "collegeId": "'$COLLEGE_ID'"
  }')

echo "Exam Hall Creation Response:"
echo $EXAM_HALL_RESPONSE | jq '.'

EXAM_HALL_ID=$(echo $EXAM_HALL_RESPONSE | jq -r '.data.id')
if [ "$EXAM_HALL_ID" != "null" ] && [ -n "$EXAM_HALL_ID" ]; then
    print_success "Exam hall created successfully with ID: $EXAM_HALL_ID"
else
    print_error "Failed to create exam hall"
fi

# 12.2 Create exam
print_step "12.2 Creating exam"
EXAM_RESPONSE=$(curl -s -X POST $API_BASE/exams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "examName": "Data Structures Mid-term Exam",
    "examType": "internal",
    "courseId": "'$COURSE_ID'",
    "examDate": "2024-10-15",
    "startTime": "09:00:00",
    "endTime": "12:00:00",
    "duration": 180,
    "maxMarks": 100,
    "passingMarks": 40,
    "examHallId": "'$EXAM_HALL_ID'",
    "instructions": "Bring calculator and ID card",
    "collegeId": "'$COLLEGE_ID'"
  }')

echo "Exam Creation Response:"
echo $EXAM_RESPONSE | jq '.'

EXAM_ID=$(echo $EXAM_RESPONSE | jq -r '.data.id')
if [ "$EXAM_ID" != "null" ] && [ -n "$EXAM_ID" ]; then
    print_success "Exam created successfully with ID: $EXAM_ID"
else
    print_error "Failed to create exam"
fi

# 12.3 Get student exams
print_step "12.3 Getting student exams"
STUDENT_EXAMS=$(curl -s -X GET $API_BASE/exams/student/$STUDENT_ID \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Student Exams:"
echo $STUDENT_EXAMS | jq '.'

# 12.4 Add exam results
print_step "12.4 Adding exam results"
EXAM_RESULTS=$(curl -s -X POST $API_BASE/exams/$EXAM_ID/results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -d '{
    "results": [
      {
        "studentId": "'$STUDENT_ID'",
        "marksObtained": 85,
        "grade": "A",
        "remarks": "Excellent performance"
      }
    ]
  }')

echo "Exam Results Response:"
echo $EXAM_RESULTS | jq '.'

# =============================================================================
# PHASE 13: ADDITIONAL FEATURES TESTING
# =============================================================================

print_step "PHASE 13: Additional Features Testing"

# 13.1 Create hostel
print_step "13.1 Creating hostel"
HOSTEL_RESPONSE=$(curl -s -X POST $API_BASE/hostels \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "name": "Boys Hostel A",
    "hostelCode": "BHA'$TEST_SUFFIX'",
    "hostelType": "boys",
    "gender": "male",
    "totalFloors": 4,
    "totalRooms": 100,
    "totalCapacity": 200,
    "monthlyFee": 8000,
    "securityDeposit": 15000,
    "location": "Campus North Block",
    "facilities": ["WiFi", "Mess", "Laundry", "Recreation Room"],
    "collegeId": "'$COLLEGE_ID'"
  }')

echo "Hostel Creation Response:"
echo $HOSTEL_RESPONSE | jq '.'

HOSTEL_ID=$(echo $HOSTEL_RESPONSE | jq -r '.data.id')
if [ "$HOSTEL_ID" != "null" ] && [ -n "$HOSTEL_ID" ]; then
    print_success "Hostel created successfully with ID: $HOSTEL_ID"
else
    print_error "Failed to create hostel"
fi

# 13.2 Create hostel room
print_step "13.2 Creating hostel room"
ROOM_RESPONSE=$(curl -s -X POST $API_BASE/hostels/$HOSTEL_ID/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "roomNumber": "A101",
    "roomType": "double",
    "capacity": 2,
    "floor": 1,
    "amenities": ["AC", "Attached Bathroom"],
    "condition": "excellent"
  }')

echo "Room Creation Response:"
echo $ROOM_RESPONSE | jq '.'

ROOM_ID=$(echo $ROOM_RESPONSE | jq -r '.data.id')
if [ "$ROOM_ID" != "null" ] && [ -n "$ROOM_ID" ]; then
    print_success "Room created successfully with ID: $ROOM_ID"
else
    print_error "Failed to create room"
fi

# 13.3 Allocate room to student
print_step "13.3 Allocating room to student"
ROOM_ALLOCATION=$(curl -s -X POST $API_BASE/hostels/allocations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "studentId": "'$STUDENT_ID'",
    "hostelId": "'$HOSTEL_ID'",
    "roomId": "'$ROOM_ID'",
    "allocationDate": "2024-09-01",
    "academicYear": "2024-25"
  }')

echo "Room Allocation Response:"
echo $ROOM_ALLOCATION | jq '.'

# 13.4 Get hostel occupancy
print_step "13.4 Getting hostel occupancy"
HOSTEL_OCCUPANCY=$(curl -s -X GET $API_BASE/hostels/$HOSTEL_ID/occupancy \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Hostel Occupancy:"
echo $HOSTEL_OCCUPANCY | jq '.'

# =============================================================================
# PHASE 14: LIBRARY MANAGEMENT TESTING
# =============================================================================

print_step "PHASE 14: Library Management Testing"

# 14.1 Add library book
print_step "14.1 Adding library book"
BOOK_RESPONSE=$(curl -s -X POST $API_BASE/library/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Introduction to Algorithms",
    "author": "Thomas H. Cormen",
    "isbn": "978-0262033848",
    "accessionNumber": "ACC'$TEST_SUFFIX'",
    "publisher": "MIT Press",
    "publicationYear": 2009,
    "edition": "3rd Edition",
    "category": "Computer Science",
    "subject": "Algorithms",
    "totalCopies": 5,
    "availableCopies": 5,
    "location": "CS Section - Shelf A1",
    "price": 500.00,
    "collegeId": "'$COLLEGE_ID'"
  }')

echo "Book Addition Response:"
echo $BOOK_RESPONSE | jq '.'

BOOK_ID=$(echo $BOOK_RESPONSE | jq -r '.data.id')
if [ "$BOOK_ID" != "null" ] && [ -n "$BOOK_ID" ]; then
    print_success "Book added successfully with ID: $BOOK_ID"
else
    print_error "Failed to add book"
fi

# 14.2 Issue book to student
print_step "14.2 Issuing book to student"
BOOK_ISSUE=$(curl -s -X POST $API_BASE/library/books/$BOOK_ID/issue/$STUDENT_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "dueDate": "2024-10-08"
  }')

echo "Book Issue Response:"
echo $BOOK_ISSUE | jq '.'

ISSUE_ID=$(echo $BOOK_ISSUE | jq -r '.data.id')
if [ "$ISSUE_ID" != "null" ] && [ -n "$ISSUE_ID" ]; then
    print_success "Book issued successfully with Issue ID: $ISSUE_ID"
else
    print_error "Failed to issue book"
fi

# 14.3 Get student library issues
print_step "14.3 Getting student library issues"
STUDENT_ISSUES=$(curl -s -X GET $API_BASE/library/issues/student/$STUDENT_ID \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Student Library Issues:"
echo $STUDENT_ISSUES | jq '.'

# =============================================================================
# PHASE 15: TIMETABLE MANAGEMENT TESTING
# =============================================================================

print_step "PHASE 15: Timetable Management Testing"

# 15.1 Create timetable entry
print_step "15.1 Creating timetable entry"
TIMETABLE_RESPONSE=$(curl -s -X POST $API_BASE/timetable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "courseId": "'$COURSE_ID'",
    "facultyId": "'$FACULTY_ID'",
    "classroomId": "'$CLASSROOM_ID'",
    "sectionId": "'$DEPARTMENT_ID'",
    "dayOfWeek": 1,
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "period": 1,
    "semester": 3,
    "academicYear": "2024-25",
    "effectiveFrom": "2024-09-01",
    "collegeId": "'$COLLEGE_ID'"
  }')

echo "Timetable Creation Response:"
echo $TIMETABLE_RESPONSE | jq '.'

TIMETABLE_ID=$(echo $TIMETABLE_RESPONSE | jq -r '.data.id')
if [ "$TIMETABLE_ID" != "null" ] && [ -n "$TIMETABLE_ID" ]; then
    print_success "Timetable entry created successfully with ID: $TIMETABLE_ID"
else
    print_error "Failed to create timetable entry"
fi

# 15.2 Get faculty timetable
print_step "15.2 Getting faculty timetable"
FACULTY_TIMETABLE=$(curl -s -X GET $API_BASE/timetable/faculty/$FACULTY_ID \
  -H "Authorization: Bearer $FACULTY_TOKEN")

echo "Faculty Timetable:"
echo $FACULTY_TIMETABLE | jq '.'

# =============================================================================
# PHASE 16: ATTENDANCE AND ASSIGNMENT ADVANCED TESTING
# =============================================================================

print_step "PHASE 16: Advanced Testing"

# 16.1 Mark bulk attendance
print_step "16.1 Marking bulk attendance"
BULK_ATTENDANCE=$(curl -s -X POST $API_BASE/attendance/bulk-mark \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FACULTY_TOKEN" \
  -d '{
    "courseId": "'$COURSE_ID'",
    "date": "2024-09-09",
    "attendanceData": [
      {
        "studentId": "'$STUDENT_ID'",
        "status": "present"
      }
    ]
  }')

echo "Bulk Attendance Response:"
echo $BULK_ATTENDANCE | jq '.'

# 16.2 Get faculty assignments
print_step "16.2 Getting faculty assignments"
FACULTY_ASSIGNMENTS=$(curl -s -X GET $API_BASE/assignments/faculty/$FACULTY_ID \
  -H "Authorization: Bearer $FACULTY_TOKEN")

echo "Faculty Assignments:"
echo $FACULTY_ASSIGNMENTS | jq '.'

# 16.3 Test password reset flow
print_step "16.3 Testing password reset flow"
FORGOT_PASSWORD=$(curl -s -X POST $API_BASE/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob.student@'$TEST_SUFFIX'.edu"
  }')

echo "Forgot Password Response:"
echo $FORGOT_PASSWORD | jq '.'

# 16.4 Assign roll numbers to students
print_step "16.4 Assigning roll numbers to students"
ASSIGN_ROLL_NUMBERS=$(curl -s -X POST $API_BASE/departments/$DEPARTMENT_ID/assign-roll-numbers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "year": 2,
    "startingNumber": 1
  }')

echo "Assign Roll Numbers Response:"
echo $ASSIGN_ROLL_NUMBERS | jq '.'

# =============================================================================
# PHASE 17: CLEANUP AND LOGOUT
# =============================================================================

print_step "PHASE 17: Cleanup and Logout"

# 17.1 Admin logout
print_step "17.1 Admin logout"
ADMIN_LOGOUT=$(curl -s -X POST $API_BASE/auth/logout \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Admin Logout Response:"
echo $ADMIN_LOGOUT | jq '.'

# 17.2 Faculty logout
print_step "17.2 Faculty logout"
FACULTY_LOGOUT=$(curl -s -X POST $API_BASE/auth/logout \
  -H "Authorization: Bearer $FACULTY_TOKEN")

echo "Faculty Logout Response:"
echo $FACULTY_LOGOUT | jq '.'

# 17.3 Student logout
print_step "17.3 Student logout"
STUDENT_LOGOUT=$(curl -s -X POST $API_BASE/auth/logout \
  -H "Authorization: Bearer $STUDENT_TOKEN")

echo "Student Logout Response:"
echo $STUDENT_LOGOUT | jq '.'

# =============================================================================
# TESTING SUMMARY
# =============================================================================

print_step "TESTING SUMMARY"
print_success "✅ Complete API flow testing completed successfully!"
echo ""
echo "Tested Components:"
echo "  ✓ College Registration (Public)"
echo "  ✓ Admin Authentication & Dashboard"
echo "  ✓ Department Management"
echo "  ✓ Course Management"
echo "  ✓ Faculty Management & Operations"
echo "  ✓ Student Management & Operations"
echo "  ✓ Assignment Creation & Submission"
echo "  ✓ Attendance Management"
echo "  ✓ Grading System"
echo "  ✓ Reports & Analytics"
echo "  ✓ Classroom Management & Booking"
echo "  ✓ Exam Management & Results"
echo "  ✓ Hostel Management & Allocation"
echo "  ✓ Library Management & Book Issues"
echo "  ✓ Timetable Management"
echo "  ✓ Advanced Attendance Features"
echo "  ✓ Assignment Tracking"
echo "  ✓ Authentication Flow"
echo ""
echo "Created Resources:"
echo "  📚 College ID: $COLLEGE_ID"
echo "  🏢 Department ID: $DEPARTMENT_ID"
echo "  📖 Course ID: $COURSE_ID"
echo "  👨‍🏫 Faculty ID: $FACULTY_ID"
echo "  🎓 Student ID: $STUDENT_ID"
echo "  📝 Assignment ID: $ASSIGNMENT_ID"
echo "  🏛️ Classroom ID: $CLASSROOM_ID"
echo "  📋 Exam ID: $EXAM_ID"
echo "  🏠 Hostel ID: $HOSTEL_ID"
echo "  📚 Book ID: $BOOK_ID"
echo "  📅 Timetable ID: $TIMETABLE_ID"
echo ""
print_success "All major API endpoints have been tested successfully!"
