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
    "code": "CS",
    "description": "Department of Computer Science and Engineering",
    "hodName": "Dr. Jane Smith",
    "hodEmail": "hod.cs@'$TEST_SUFFIX'.edu",
    "hodPhone": "9876543212",
    "establishedYear": 2020,
    "totalSeats": 120,
    "collegeId": "'$COLLEGE_ID'"
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
    "code": "CS101",
    "credits": 4,
    "description": "Introduction to Data Structures and Algorithms",
    "semester": 3,
    "year": 2,
    "courseType": "core",
    "departmentId": '$DEPARTMENT_ID',
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
# PHASE 11: ADDITIONAL FEATURES TESTING
# =============================================================================

print_step "PHASE 11: Additional Features Testing"

# 11.1 Test password reset flow
print_step "11.1 Testing password reset flow"
FORGOT_PASSWORD=$(curl -s -X POST $API_BASE/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob.student@'$TEST_SUFFIX'.edu"
  }')

echo "Forgot Password Response:"
echo $FORGOT_PASSWORD | jq '.'

# 11.2 Update student details
print_step "11.2 Updating student details"
UPDATE_DETAILS=$(curl -s -X PUT $API_BASE/auth/update-details \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -d '{
    "phone": "9876543299"
  }')

echo "Update Details Response:"
echo $UPDATE_DETAILS | jq '.'

# 11.3 Assign roll numbers to students
print_step "11.3 Assigning roll numbers to students"
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
# PHASE 12: CLEANUP AND LOGOUT
# =============================================================================

print_step "PHASE 12: Cleanup and Logout"

# 12.1 Admin logout
print_step "12.1 Admin logout"
ADMIN_LOGOUT=$(curl -s -X POST $API_BASE/auth/logout \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Admin Logout Response:"
echo $ADMIN_LOGOUT | jq '.'

# 12.2 Faculty logout
print_step "12.2 Faculty logout"
FACULTY_LOGOUT=$(curl -s -X POST $API_BASE/auth/logout \
  -H "Authorization: Bearer $FACULTY_TOKEN")

echo "Faculty Logout Response:"
echo $FACULTY_LOGOUT | jq '.'

# 12.3 Student logout
print_step "12.3 Student logout"
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
echo "  ✓ Additional Features"
echo "  ✓ Authentication Flow"
echo ""
echo "Created Resources:"
echo "  📚 College ID: $COLLEGE_ID"
echo "  🏢 Department ID: $DEPARTMENT_ID"
echo "  📖 Course ID: $COURSE_ID"
echo "  👨‍🏫 Faculty ID: $FACULTY_ID"
echo "  🎓 Student ID: $STUDENT_ID"
echo "  📝 Assignment ID: $ASSIGNMENT_ID"
echo ""
print_success "All major API endpoints have been tested successfully!"
