# Faculty Attendance System

## Overview

A comprehensive attendance management system that allows faculty members to mark, view, and manage student attendance for their classes. The system integrates with the existing timetable, course, and student management modules.

## Features

### Faculty Features

1. **View Daily Classes**
   - See all scheduled classes for a specific date
   - View class details including course, section, time slots, and student count
   - Filter by date to view past or upcoming classes

2. **Mark Attendance**
   - Select a class from the daily schedule
   - View complete student list with roll numbers and enrollment numbers
   - Mark attendance with four status options:
     - **Present**: Student attended the class
     - **Absent**: Student was absent
     - **Late**: Student arrived late
     - **Excused**: Absence was excused
   - Bulk actions:
     - Mark all students as present
     - Mark all students as absent
   - Add optional class topic
   - Search students by name, roll number, or enrollment number

3. **Real-time Statistics**
   - View live attendance statistics while marking
   - See total count of present, absent, late, and excused students
   - Calculate attendance percentage

4. **Update Attendance**
   - Modify previously marked attendance records
   - Track modification history with timestamps and reasons
   - Only authorized faculty can update records

5. **View Records**
   - Access historical attendance data
   - Filter by date range, course, section, or student
   - Generate attendance summaries and reports

## Technical Architecture

### Backend Structure

#### Models

**Attendance Model** (`backend/src/shared/db/models/postgresql/Attendance.js`)
```javascript
{
  id: UUID (Primary Key)
  studentId: UUID (Foreign Key -> students)
  courseId: UUID (Foreign Key -> courses)
  facultyId: UUID (Foreign Key -> faculty)
  attendanceDate: DATE
  period: INTEGER
  status: ENUM('present', 'absent', 'late', 'excused')
  classType: ENUM('theory', 'practical', 'tutorial')
  topic: STRING
  markedBy: UUID (Foreign Key -> faculty)
  markedAt: TIMESTAMP
  modifiedBy: UUID (Foreign Key -> faculty)
  modifiedAt: TIMESTAMP
  modificationReason: STRING
}
```

**Associations:**
- Attendance belongs to Student
- Attendance belongs to Course
- Attendance belongs to Faculty (multiple associations for facultyId and markedBy)
- Student has many Attendance records
- Faculty has many Attendance records

#### Controllers

**Attendance Controller** (`backend/src/faculty/controllers/attendanceController.js`)

Functions:
1. `getFacultyClasses` - Get faculty's classes for a specific date
2. `getClassStudents` - Get students in a class with existing attendance
3. `markBulkAttendance` - Mark attendance for multiple students at once
4. `getCourseAttendance` - Get attendance records for a course
5. `getAttendanceSummary` - Get attendance statistics and summary
6. `updateAttendance` - Update a single attendance record
7. `deleteAttendance` - Delete an attendance record (faculty/admin only)

#### Routes

**Attendance Routes** (`backend/src/faculty/routes/attendanceRoutes.js`)

```
GET    /api/faculty/attendance/classes                    - Get faculty's classes
GET    /api/faculty/attendance/students/:courseId/:sectionId - Get class students
POST   /api/faculty/attendance/mark                       - Mark bulk attendance
GET    /api/faculty/attendance/records/:courseId          - Get course attendance
GET    /api/faculty/attendance/summary/:courseId          - Get attendance summary
PUT    /api/faculty/attendance/:attendanceId              - Update attendance
DELETE /api/faculty/attendance/:attendanceId              - Delete attendance
```

All routes are protected and require authentication. Faculty and admin roles have access.

### Frontend Structure

**Attendance Page** (`frontend/app/staff/attendance/page.tsx`)

#### Components:

1. **Date and Class Selection**
   - Date picker for selecting attendance date
   - Class type selector (Theory/Practical/Tutorial)
   - Grid view of scheduled classes with course and section details

2. **Student List Table**
   - Searchable and filterable student list
   - Inline attendance status selector for each student
   - Quick actions for bulk marking

3. **Statistics Dashboard**
   - Real-time attendance statistics
   - Visual cards showing present, absent, late, excused counts
   - Total student count

4. **Tabs**
   - **Mark Attendance**: Main interface for marking attendance
   - **View Records**: Interface for viewing historical records (placeholder)

#### Key Features:

- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Statistics update as faculty marks attendance
- **Search Functionality**: Quick search across student names and IDs
- **Visual Feedback**: Color-coded status indicators
- **Error Handling**: Clear error messages and loading states
- **Auto-save Detection**: Detects already marked attendance

## API Endpoints

### 1. Get Faculty's Classes

```http
GET /api/faculty/attendance/classes?date=2024-10-03
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "class-uuid",
      "period": 1,
      "dayOfWeek": 1,
      "startTime": "09:00",
      "endTime": "10:00",
      "classType": "theory",
      "course": {
        "id": "course-uuid",
        "code": "CS101",
        "name": "Introduction to Computer Science",
        "department": {
          "name": "Computer Science",
          "code": "CS"
        }
      },
      "section": {
        "id": "section-uuid",
        "name": "Section A",
        "code": "CS-A-2024",
        "batch": "2024",
        "semester": 1,
        "currentStrength": 45
      }
    }
  ]
}
```

### 2. Get Class Students

```http
GET /api/faculty/attendance/students/:courseId/:sectionId?date=2024-10-03&period=1
```

**Response:**
```json
{
  "success": true,
  "count": 45,
  "data": [
    {
      "id": "student-uuid",
      "rollNumber": "CS2024001",
      "enrollmentNumber": "E2024CS001",
      "name": "John Doe",
      "email": "john@example.com",
      "batch": "2024",
      "currentSemester": 1,
      "attendance": {
        "id": "attendance-uuid",
        "status": "present",
        "topic": "Introduction to Programming",
        "classType": "theory",
        "markedAt": "2024-10-03T09:15:00Z"
      }
    }
  ]
}
```

### 3. Mark Bulk Attendance

```http
POST /api/faculty/attendance/mark
```

**Request Body:**
```json
{
  "courseId": "course-uuid",
  "sectionId": "section-uuid",
  "date": "2024-10-03",
  "period": 1,
  "classType": "theory",
  "topic": "Introduction to Programming",
  "attendanceRecords": [
    {
      "studentId": "student-uuid-1",
      "status": "present"
    },
    {
      "studentId": "student-uuid-2",
      "status": "absent"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully marked attendance for 45 students",
  "data": {
    "marked": 45,
    "errors": 0,
    "errorDetails": []
  }
}
```

### 4. Get Course Attendance

```http
GET /api/faculty/attendance/records/:courseId?startDate=2024-10-01&endDate=2024-10-31&sectionId=section-uuid
```

**Response:**
```json
{
  "success": true,
  "count": 135,
  "data": [
    {
      "id": "attendance-uuid",
      "attendanceDate": "2024-10-03",
      "period": 1,
      "status": "present",
      "classType": "theory",
      "topic": "Introduction to Programming",
      "markedAt": "2024-10-03T09:15:00Z",
      "student": {
        "id": "student-uuid",
        "rollNumber": "CS2024001",
        "enrollmentNumber": "E2024CS001",
        "user": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      "markedByFaculty": {
        "id": "faculty-uuid",
        "employeeId": "FAC001",
        "user": {
          "name": "Dr. Smith"
        }
      }
    }
  ]
}
```

### 5. Get Attendance Summary

```http
GET /api/faculty/attendance/summary/:courseId?sectionId=section-uuid&startDate=2024-10-01&endDate=2024-10-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClasses": 15,
    "studentWiseAttendance": [
      {
        "studentId": "student-uuid",
        "studentName": "John Doe",
        "rollNumber": "CS2024001",
        "present": 13,
        "absent": 1,
        "late": 1,
        "excused": 0,
        "total": 15,
        "percentage": "86.67"
      }
    ],
    "summary": {
      "totalRecords": 675,
      "uniqueStudents": 45
    }
  }
}
```

### 6. Update Attendance

```http
PUT /api/faculty/attendance/:attendanceId
```

**Request Body:**
```json
{
  "status": "excused",
  "modificationReason": "Medical certificate submitted"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "attendance-uuid",
    "status": "excused",
    "modifiedBy": "faculty-uuid",
    "modifiedAt": "2024-10-03T15:30:00Z",
    "modificationReason": "Medical certificate submitted"
  }
}
```

## Database Schema

### Table: `attendance`

```sql
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  faculty_id UUID NOT NULL REFERENCES faculty(id),
  attendance_date DATE NOT NULL,
  period INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  class_type VARCHAR(20) DEFAULT 'theory' CHECK (class_type IN ('theory', 'practical', 'tutorial')),
  topic VARCHAR(200),
  marked_by UUID NOT NULL REFERENCES faculty(id),
  marked_at TIMESTAMP DEFAULT NOW(),
  modified_by UUID REFERENCES faculty(id),
  modified_at TIMESTAMP,
  modification_reason VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(student_id, course_id, attendance_date, period)
);

-- Indexes
CREATE INDEX idx_attendance_student ON attendance(student_id);
CREATE INDEX idx_attendance_course ON attendance(course_id);
CREATE INDEX idx_attendance_faculty ON attendance(faculty_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);
```

## Permissions

The following permissions are required:

- `attendance:create` - Mark new attendance
- `attendance:read` - View attendance records
- `attendance:update` - Update existing attendance
- `attendance:delete` - Delete attendance records

Faculty members automatically have create and update permissions for their own classes.

## Integration Points

### 1. Timetable System
- Fetches scheduled classes based on faculty assignment
- Links attendance to specific periods and class types

### 2. Course Management
- Associates attendance with courses
- Validates faculty authorization to mark attendance

### 3. Section Management
- Groups students by sections
- Retrieves student lists for attendance marking

### 4. Student Management
- Links attendance to student profiles
- Tracks individual attendance history

### 5. Logging System
- Records all attendance marking activities
- Tracks modifications and deletions
- Maintains audit trail

## UI Navigation

Faculty can access the attendance system through:

1. **Sidebar Navigation**: "Attendance" link in the staff sidebar
2. **Dashboard**: Quick link to mark attendance for today's classes
3. **Direct URL**: `/staff/attendance`

## Best Practices

1. **Mark Attendance Promptly**: Mark attendance immediately after or during class
2. **Use Appropriate Status**: Choose the correct status (present/absent/late/excused)
3. **Add Topics**: Record class topics for better record keeping
4. **Review Before Saving**: Double-check attendance before final submission
5. **Update if Needed**: Update attendance records if mistakes are found
6. **Document Changes**: Provide clear reasons when modifying attendance

## Future Enhancements

1. **Attendance Reports**: Generate detailed reports and analytics
2. **Notifications**: Alert students about their attendance status
3. **Biometric Integration**: Connect with biometric attendance devices
4. **Mobile App**: Dedicated mobile app for quick attendance marking
5. **QR Code Scanning**: Allow students to mark attendance via QR codes
6. **Analytics Dashboard**: Visual analytics and trends
7. **Export Functionality**: Export attendance data to Excel/PDF
8. **Automated Alerts**: Send alerts for low attendance students
9. **Parent Portal**: Allow parents to view student attendance
10. **Integration with Exams**: Link attendance to exam eligibility

## Troubleshooting

### Issue: Classes not showing up

**Solution**: 
- Verify timetable entries exist for the selected date
- Check if faculty is assigned to courses
- Ensure timetable entries are marked as active

### Issue: Students not appearing in list

**Solution**:
- Confirm students are assigned to the section
- Check if students are marked as active
- Verify course-section associations

### Issue: Cannot save attendance

**Solution**:
- Check network connectivity
- Verify faculty permissions
- Ensure all required fields are filled
- Check for duplicate attendance entries

### Issue: Attendance stats not updating

**Solution**:
- Refresh the page
- Clear browser cache
- Check for JavaScript errors in console

## Security Considerations

1. **Authorization**: Only assigned faculty can mark attendance for their classes
2. **Validation**: All inputs are validated on both client and server
3. **Audit Trail**: All actions are logged for accountability
4. **Data Integrity**: Unique constraints prevent duplicate entries
5. **Modification Tracking**: All changes are tracked with timestamps and reasons

## Support

For issues or questions about the attendance system:
- Contact: System Administrator
- Email: support@yourinstitution.edu
- Documentation: This file

## Version History

- **v1.0.0** (October 2024): Initial release
  - Basic attendance marking
  - Class selection interface
  - Student list view
  - Bulk operations
  - Real-time statistics

