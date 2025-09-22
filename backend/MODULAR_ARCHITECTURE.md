# OnchainERP Backend - Modular Architecture

## Architecture Overview

The backend has been restructured to follow a modular architecture pattern, organizing code by feature domains rather than by technical layers. This improves maintainability, scalability, and code organization.

## Directory Structure

```
backend/src/
├── app.js                 # Main application entry point
├── server.js              # Server startup (now imports app.js)
├── admissions/            # Student admissions and management
│   ├── controllers/
│   │   └── studentController.js
│   ├── services/
│   │   └── admissionService.js
│   ├── models/
│   │   └── index.js
│   └── routes.js
├── fees/                  # Fee management and financial transactions
│   ├── controllers/
│   │   └── financeController.js
│   ├── services/
│   │   └── feesService.js
│   ├── models/
│   │   └── index.js
│   └── routes.js
├── hostel/               # Hostel management
│   ├── controllers/
│   │   └── hostelController.js
│   ├── services/
│   │   └── hostelService.js
│   ├── models/
│   │   └── index.js
│   └── routes.js
├── dashboard/            # Administrative dashboard and management
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── facultyController.js
│   │   ├── courseController.js
│   │   ├── departmentController.js
│   │   └── ... (other management controllers)
│   ├── services/
│   │   └── dashboardService.js
│   ├── models/
│   │   └── index.js
│   └── routes.js (+ individual route files)
└── shared/               # Shared utilities and services
    ├── db/
    │   ├── models/       # All database models
    │   ├── database.js   # Database configuration
    │   └── swagger.json  # API documentation
    ├── middleware/       # Authentication, validation, etc.
    ├── services/         # Shared services (logging, file handling, auth)
    ├── utils/            # Utility functions
    └── ...
```

## Modules

### 1. Admissions Module (`/admissions`)
**Purpose**: Manages student admissions, enrollment, and student-related operations.

**Routes**: 
- `/api/admissions/*` (new)
- `/api/students/*` (backward compatibility)

**Key Features**:
- Student registration and management
- Admission processing
- Student profile management
- Course enrollment

### 2. Fees Module (`/fees`)
**Purpose**: Handles all financial transactions, fee collection, and payment processing.

**Routes**: 
- `/api/fees/*` (new)
- `/api/finance/*` (backward compatibility)

**Key Features**:
- Fee structure management
- Payment processing
- Financial reporting
- Transaction tracking

### 3. Hostel Module (`/hostel`)
**Purpose**: Manages hostel accommodations, room allocations, and hostel operations.

**Routes**: 
- `/api/hostels/*`

**Key Features**:
- Hostel and room management
- Room allocation/deallocation
- Occupancy tracking
- Student check-in/check-out

### 4. Dashboard Module (`/dashboard`)
**Purpose**: Provides administrative interfaces and management functions for faculty, courses, and system administration.

**Routes**: 
- `/api/dashboard/*` (new consolidated endpoint)
- Individual endpoints for backward compatibility:
  - `/api/admin/*`
  - `/api/faculty/*`
  - `/api/courses/*`
  - `/api/departments/*`
  - `/api/colleges/*`
  - etc.

**Key Features**:
- Administrative dashboards
- Faculty management
- Course and curriculum management
- System analytics and reporting

### 5. Shared Module (`/shared`)
**Purpose**: Contains common utilities, services, and configurations used across all modules.

**Components**:
- **Database**: Models, connections, migrations
- **Middleware**: Authentication, validation, error handling
- **Services**: Logging, file handling, email, authentication
- **Utils**: Helper functions, generators, seeders

## Key Benefits

### 1. **Separation of Concerns**
Each module handles a specific domain, making the codebase easier to understand and maintain.

### 2. **Scalability**
New features can be added as separate modules without affecting existing functionality.

### 3. **Team Collaboration**
Different teams can work on different modules independently.

### 4. **Reusability**
Shared services and utilities can be reused across modules.

### 5. **Testing**
Modules can be tested independently, improving test coverage and reliability.

## Migration Notes

### Backward Compatibility
All existing API endpoints continue to work as before. The restructuring is primarily internal and maintains the same external interface.

### Import Path Changes
- Models: `require('../../shared/db/models')`
- Middleware: `require('../../shared/middleware/auth')`
- Services: `require('../../shared/services/LoggingService')`
- Utils: `require('../../shared/utils/errorResponse')`

## Development Guidelines

### 1. **Adding New Features**
- Determine which module the feature belongs to
- If it doesn't fit existing modules, consider creating a new module
- Follow the established folder structure within modules

### 2. **Shared Code**
- Place reusable code in the `shared` directory
- Use services for business logic that spans multiple modules
- Keep utilities generic and stateless

### 3. **Module Communication**
- Modules should communicate through shared services
- Avoid direct imports between modules
- Use events or shared database models for data exchange

### 4. **Database Models**
- All models remain in `shared/db/models`
- Each module has an index file that imports relevant models
- This maintains database consistency while providing module-specific interfaces

## Environment Setup

No changes are required to environment variables or deployment processes. The application entry point remains the same (`server.js`), but it now imports the modular `app.js`.

## API Documentation

The Swagger documentation remains available at `/api-docs` and includes all endpoints from all modules.

## Health Check

The health check endpoint (`/health`) now includes information about the modular architecture:

```json
{
  "status": "ok",
  "message": "Server is running",
  "environment": "development",
  "architecture": "modular",
  "modules": [
    "admissions",
    "fees", 
    "hostel",
    "dashboard",
    "shared"
  ]
}
```
