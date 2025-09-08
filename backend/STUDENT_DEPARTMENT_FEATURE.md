# Student Department Auto-Assignment Feature

This feature allows administrators to add students to departments and automatically assign them to courses based on their department and current semester.

## New API Endpoints

### 1. Create Student with Auto Course Assignment
**POST** `/api/students`

Creates a new student and automatically assigns them to courses based on their department and semester.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123",
  "enrollmentNumber": "ENR2024001",
  "batch": "2024",
  "program": "Computer Science",
  "currentSemester": 1,
  "department": "Computer Science",
  "contactNumber": "+1234567890",
  "address": "123 Main St, City, State"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "student_id",
    "user": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Computer Science"
    },
    "enrollmentNumber": "ENR2024001",
    "batch": "2024",
    "program": "Computer Science",
    "currentSemester": 1,
    "department": "Computer Science",
    "courses": [
      {
        "code": "CS101",
        "name": "Introduction to Programming",
        "credits": 3,
        "semester": 1
      }
    ]
  },
  "message": "Student created and automatically assigned to 5 courses for Computer Science department, semester 1"
}
```

### 2. Add Student to Department with Auto Course Assignment
**POST** `/api/students/:id/department`

Moves an existing student to a new department and automatically assigns them to courses for that department.

**Request Body:**
```json
{
  "department": "Electrical Engineering",
  "currentSemester": 2
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "student_id",
    "user": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "department": "Electrical Engineering"
    },
    "enrollmentNumber": "ENR2024001",
    "department": "Electrical Engineering",
    "currentSemester": 2,
    "courses": [
      {
        "code": "EE201",
        "name": "Circuit Analysis",
        "credits": 4,
        "semester": 2
      }
    ]
  },
  "message": "Student moved to Electrical Engineering department and automatically assigned to 4 courses for semester 2"
}
```

### 3. Get Courses by Department and Semester
**GET** `/api/courses/department/:department/semester/:semester`

Preview courses that will be automatically assigned to students in a specific department and semester.

**Example:** `/api/courses/department/Computer Science/semester/1`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "code": "CS101",
      "name": "Introduction to Programming",
      "description": "Basic programming concepts",
      "credits": 3,
      "semester": 1,
      "department": "Computer Science",
      "faculty": {
        "employeeId": "FAC001",
        "user": {
          "name": "Dr. Smith",
          "email": "dr.smith@example.com"
        }
      }
    }
  ],
  "message": "Found 5 courses for Computer Science department, semester 1"
}
```

## How It Works

1. **Course Assignment Logic**: When a student is added to a department, the system automatically finds all courses that match:
   - The student's department
   - The student's current semester

2. **Automatic Updates**: 
   - Student's course list is updated
   - Each course's student list is updated
   - Previous course assignments are removed when changing departments

3. **Data Consistency**: 
   - Both User and Student models are updated with department information
   - Bidirectional relationships are maintained between students and courses

## Usage Examples

### Creating a New Student
```bash
curl -X POST http://localhost:5000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "password123",
    "enrollmentNumber": "ENR2024002",
    "batch": "2024",
    "program": "Computer Science",
    "currentSemester": 1,
    "department": "Computer Science",
    "contactNumber": "+1234567891"
  }'
```

### Moving Student to New Department
```bash
curl -X POST http://localhost:5000/api/students/{student_id}/department \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "department": "Mechanical Engineering",
    "currentSemester": 3
  }'
```

### Preview Department Courses
```bash
curl -X GET "http://localhost:5000/api/courses/department/Computer%20Science/semester/1" \
  -H "Authorization: Bearer {admin_token}"
```

## Model Updates

### Student Model
Added `department` field:
```javascript
department: {
  type: String,
  required: [true, 'Please add a department']
}
```

## Authorization

- **Admin Only**: All new endpoints require admin authorization
- **JWT Authentication**: All requests must include valid JWT token
- **Role-Based Access**: Only users with admin role can manage student departments

## Error Handling

The API includes comprehensive error handling for:
- Invalid department names
- Non-existent students
- Course assignment failures
- Database connection issues
- Validation errors

## Dependencies

This feature builds upon existing models:
- User model (for authentication and basic info)
- Student model (for academic info)
- Course model (for course details)
- Existing authentication middleware
