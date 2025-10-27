# OnchainERP Backend

This is the Express.js backend for the OnchainERP student management system.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Role-Based Access Control
- Multer for File Uploads
- Swagger API Documentation

## Features

### Authentication & Authorization

- Secure JWT-based authentication
- Role-based access control (Student, Faculty, Admin)
- Permission-based resource access
- Password encryption with bcrypt
- Password reset functionality

### Student Management

- Comprehensive student profiles
- Course registration
- Assignment submission
- View attendance and grades
- Register for events

### Faculty Management

- Faculty profiles with expertise and qualifications
- Course assignment
- Mark student attendance
- Grade assignments
- Create and manage assignments

### Course Management

- Create and manage courses
- Assign faculty to courses
- Enroll students in courses
- Manage assignments and attendance

### Admin Dashboard

- System statistics
- Attendance reports
- Grade reports
- Department management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB installed locally or a MongoDB Atlas account

### Installation

1. Clone the repository
2. Navigate to the backend directory
```bash
cd OnchainERP/backend
```

3. Install dependencies
```bash
npm install
```

4. Set up environment variables
```bash
cp .env.example .env
```
Edit the `.env` file to configure your MongoDB URI, JWT secret, etc.

5. Run the development server
```bash
npm run dev
```

6. Seed the database with sample data (optional)
```bash
npm run seed:import
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

### Authentication Routes

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login existing user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/update-details` - Update user details
- `PUT /api/auth/update-password` - Update password
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:resetToken` - Reset password
- `GET /api/auth/logout` - Logout user

### Student Routes

- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student details
- `GET /api/students/:id/attendance` - Get student attendance
- `GET /api/students/:id/grades` - Get student grades
- `POST /api/students/:id/assignments/:assignmentId` - Submit assignment
- `POST /api/students/:id/courses/:courseId` - Register for course

### Faculty Routes

- `GET /api/faculty` - Get all faculty
- `GET /api/faculty/:id` - Get faculty details
- `GET /api/faculty/:id/courses` - Get faculty courses
- `POST /api/faculty/:id/courses/:courseId/attendance` - Mark attendance
- `POST /api/faculty/:id/students/:studentId/assignments/:assignmentId/grade` - Grade assignment
- `POST /api/faculty/:id/courses/:courseId/assignments` - Create assignment

### Course Routes

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course
- `PUT /api/courses/:id/faculty/:facultyId` - Assign faculty
- `GET /api/courses/:id/students` - Get course students
- `GET /api/courses/:id/assignments` - Get course assignments

### Admin Routes

- `GET /api/admin/dashboard` - Get dashboard statistics
- `GET /api/admin/reports/attendance` - Get attendance report
- `GET /api/admin/reports/grades` - Get grade report
- `POST /api/admin/departments` - Create department

## Role-Based Permissions

### Student Permissions

- View own profile
- Edit own profile
- View own attendance
- View own grades
- Submit assignments
- Register for events

### Faculty Permissions

- View and edit faculty profile
- Mark and update attendance
- Assign and update grades
- Create assignments
- View course students
- Cannot access payment information

### Admin Permissions

- Manage users, courses, faculty, students
- Manage payments and events
- View attendance and grade reports
- Cannot alter attendance or grades

## Project Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   │   ├── auth.js   # Authentication middleware
│   │   ├── validate.js # Validation middleware
│   │   ├── upload.js # File upload middleware
│   │   └── errorHandler.js # Error handling middleware
│   ├── models/       # Mongoose models
│   │   ├── User.js   # User model
│   │   ├── Student.js # Student model
│   │   ├── Faculty.js # Faculty model
│   │   ├── Course.js # Course model
│   │   ├── Role.js   # Role model
│   │   └── Permission.js # Permission model
│   ├── routes/       # Route definitions
│   ├── utils/        # Utility functions
│   │   ├── email.js  # Email utility
│   │   ├── errorResponse.js # Error response utility
│   │   ├── setupRoles.js # Role initialization
│   │   └── seeder.js # Database seeder
│   └── server.js     # Entry point
├── uploads/          # Uploaded files
├── tests/            # Tests
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── package.json      # Dependencies
└── README.md         # This file
```

## Scripts

- `npm start` - Run production server
- `npm run dev` - Run development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run seed:import` - Import sample data
- `npm run seed:delete` - Delete all data
