# OnchainERP Backend - Modular Monolithic Architecture

## Overview

The backend has been successfully restructured from a traditional monolithic approach to a **modular monolithic architecture**. This design organizes code by business domains rather than technical layers, making it easier to maintain, scale, and eventually transition to microservices.

## Architecture Principles

### 1. **Domain-Driven Design**
Each module represents a specific business domain with its own:
- Models (Data layer)
- Controllers (Presentation layer)
- Services (Business logic layer)
- Routes (API endpoints)

### 2. **Separation of Concerns**
- Each module is self-contained and handles its specific domain
- Shared functionality is centralized in the `shared` module
- Cross-module dependencies are minimized and well-defined

### 3. **Microservice-Ready**
The modular structure makes it easy to extract any module into a separate microservice when needed.

## Module Structure

```
backend/src/
├── academic/                 # Academic management (courses, departments, classrooms, timetables)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── routes.js
├── administration/           # System administration (colleges, users)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── routes.js
├── admissions/              # Student admissions and enrollment
│   ├── controllers/
│   ├── models/
│   ├── services/
│   └── routes.js
├── examinations/            # Exam management and results
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── routes.js
├── faculty/                 # Faculty management and assignments
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── routes.js
├── fees/                    # Fee management and transactions
│   ├── controllers/
│   ├── models/
│   ├── services/
│   └── routes.js
├── hostel/                  # Hostel and accommodation management
│   ├── controllers/
│   ├── models/
│   ├── services/
│   └── routes.js
├── laboratory/              # Laboratory management
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── routes.js
├── library/                 # Library management
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── routes.js
├── students/                # Student services (attendance, etc.)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── routes.js
└── shared/                  # Shared utilities and services
    ├── db/
    ├── middleware/
    ├── services/
    └── utils/
```

## Module Descriptions

### 1. **Academic Module** (`/academic`)
**Domain**: Course management, departments, classrooms, and timetables

**Models**: Course, Department, Section, Classroom, Timetable

**Key Features**:
- Course creation and management
- Department administration
- Classroom allocation
- Timetable scheduling

**API Endpoints**:
- `/api/academic/*` (new modular endpoints)
- `/api/courses/*` (backward compatibility)
- `/api/departments/*` (backward compatibility)
- `/api/classrooms/*` (backward compatibility)
- `/api/timetable/*` (backward compatibility)

### 2. **Faculty Module** (`/faculty`)
**Domain**: Faculty management and assignment handling

**Models**: Faculty, Assignment, AssignmentSubmission

**Key Features**:
- Faculty profile management
- Assignment creation and management
- Assignment submission handling
- Grading system

**API Endpoints**:
- `/api/faculty-services/*` (new modular endpoints)
- `/api/faculty/*` (backward compatibility)
- `/api/assignments/*` (backward compatibility)

### 3. **Students Module** (`/students`)
**Domain**: Student services and attendance management

**Models**: Student, Attendance

**Key Features**:
- Attendance tracking
- Student service management
- Attendance analytics

**API Endpoints**:
- `/api/student-services/*` (new modular endpoints)
- `/api/attendance/*` (backward compatibility)

### 4. **Examinations Module** (`/examinations`)
**Domain**: Exam management and results

**Models**: Exam, ExamHall, ExamResult

**Key Features**:
- Exam scheduling
- Exam hall management
- Result processing
- Performance analytics

**API Endpoints**:
- `/api/examinations/*` (new modular endpoints)
- `/api/exams/*` (backward compatibility)

### 5. **Library Module** (`/library`)
**Domain**: Library and book management

**Models**: LibraryBook, LibraryIssue

**Key Features**:
- Book catalog management
- Book issue/return system
- Library analytics
- Overdue tracking

**API Endpoints**:
- `/api/library-services/*` (new modular endpoints)
- `/api/library/*` (backward compatibility)

### 6. **Laboratory Module** (`/laboratory`)
**Domain**: Laboratory management

**Models**: Lab

**Key Features**:
- Lab facility management
- Equipment tracking
- Lab scheduling

**API Endpoints**:
- `/api/laboratory/*` (new modular endpoints)
- `/api/labs/*` (backward compatibility)

### 7. **Administration Module** (`/administration`)
**Domain**: System administration and college management

**Models**: College, User

**Key Features**:
- College management
- User administration
- System configuration

**API Endpoints**:
- `/api/administration/*` (new modular endpoints)
- `/api/colleges/*` (backward compatibility)

### 8. **Fees Module** (`/fees`) - *Existing*
**Domain**: Financial transactions and fee management

**Models**: Transaction

### 9. **Hostel Module** (`/hostel`) - *Existing*
**Domain**: Hostel and accommodation management

**Models**: Hostel, HostelRoom, HostelAllocation

### 10. **Admissions Module** (`/admissions`) - *Existing*
**Domain**: Student admissions and enrollment

**Models**: Student (referenced from shared)

## Key Benefits

### 1. **Maintainability**
- Each module is self-contained and easier to understand
- Changes in one module don't affect others
- Clear separation of business logic

### 2. **Scalability**
- Modules can be scaled independently
- Easy to add new features without affecting existing ones
- Database models are distributed appropriately

### 3. **Team Collaboration**
- Different teams can work on different modules
- Reduced merge conflicts
- Clear ownership boundaries

### 4. **Testing**
- Each module can be tested independently
- Better test isolation
- Easier to mock dependencies

### 5. **Microservice Migration**
- Each module can be extracted into a microservice
- Well-defined module boundaries
- Minimal inter-module dependencies

## Data Architecture

### Model Distribution
Models are now distributed across modules based on their primary business domain:

- **Academic**: Course, Department, Section, Classroom, Timetable
- **Faculty**: Faculty, Assignment, AssignmentSubmission
- **Students**: Student (from admissions), Attendance
- **Examinations**: Exam, ExamHall, ExamResult
- **Library**: LibraryBook, LibraryIssue
- **Laboratory**: Lab
- **Administration**: College, User
- **Fees**: Transaction
- **Hostel**: Hostel, HostelRoom, HostelAllocation

### Shared Models
Core models like `User` and `College` remain in the shared module as they're used across multiple domains.

### Cross-Module Associations
Database associations between models from different modules are defined in the shared models index file to maintain referential integrity.

## API Structure

### New Modular Endpoints
```
/api/academic/*           - Academic services
/api/faculty-services/*   - Faculty services
/api/student-services/*   - Student services
/api/examinations/*       - Examination services
/api/library-services/*   - Library services
/api/laboratory/*         - Laboratory services
/api/administration/*     - Administration services
```

### Backward Compatibility
All existing endpoints continue to work:
```
/api/courses/*           -> /api/academic/courses/*
/api/faculty/*           -> /api/faculty-services/faculty/*
/api/assignments/*       -> /api/faculty-services/assignments/*
/api/attendance/*        -> /api/student-services/attendance/*
/api/exams/*            -> /api/examinations/exams/*
/api/library/*          -> /api/library-services/library/*
/api/labs/*             -> /api/laboratory/labs/*
/api/colleges/*         -> /api/administration/colleges/*
```

## Migration Benefits

### From Monolithic Dashboard
The previous monolithic `dashboard` module has been broken down into:
- **Academic** (courses, departments, classrooms, timetables)
- **Faculty** (faculty management, assignments)
- **Students** (attendance)
- **Examinations** (exams, results)
- **Library** (library management)
- **Laboratory** (lab management)
- **Administration** (colleges, admin functions)

### Microservice Transition
Each module is now ready to be extracted as a microservice:
1. **Database**: Each module has its own models
2. **API**: Clear API boundaries
3. **Business Logic**: Self-contained services
4. **Dependencies**: Minimal cross-module dependencies

## Development Guidelines

### Adding New Features
1. Identify the appropriate module for the feature
2. If no suitable module exists, create a new one
3. Follow the established folder structure
4. Update the main app.js routes

### Module Communication
- Use shared services for cross-module functionality
- Avoid direct imports between modules
- Use database associations for data relationships

### Database Changes
- Add models to the appropriate module
- Update associations in shared/db/models/index.js
- Maintain backward compatibility

## Health Check
The application health check now reports all active modules:

```json
{
  "status": "ok",
  "message": "Server is running",
  "architecture": "modular",
  "modules": [
    "admissions",
    "fees", 
    "hostel",
    "academic",
    "students",
    "faculty",
    "examinations",
    "library",
    "laboratory",
    "administration",
    "shared"
  ]
}
```

## Next Steps

1. **Testing**: Test all modules to ensure proper functionality
2. **Documentation**: Update API documentation for new endpoints
3. **Frontend Integration**: Update frontend to use new modular endpoints
4. **Performance Monitoring**: Monitor module performance independently
5. **Microservice Planning**: Plan which modules to extract first when transitioning to microservices

This modular monolithic architecture provides the best of both worlds: the simplicity of a monolith with the organizational benefits of microservices, making future scaling and maintenance much easier.
