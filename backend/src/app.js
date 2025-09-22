const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./shared/db/swagger.json');
const errorHandler = require('./shared/middleware/errorHandler');
const { connectDatabases } = require('./shared/db/database');
const { initializeRolesAndPermissions } = require('./shared/utils/setupRoles');

// Load environment variables
dotenv.config();

// Connect to both databases
connectDatabases().then(async () => {
  console.log('Both PostgreSQL and MongoDB connections established');
  // Initialize roles and permissions after DB connection
  await initializeRolesAndPermissions();
}).catch(error => {
  console.error('Database connection failed:', error);
  process.exit(1);
});

// Initialize express app
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));
app.use(cors());
app.use(helmet());
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Module Routes
app.use('/api/auth', require('./shared/services/authRoutes'));
app.use('/api/users', require('./shared/services/userRoutes'));

// Feature Module Routes
app.use('/api/admissions', require('./admissions/routes'));
app.use('/api/students', require('./admissions/routes')); // Backward compatibility
app.use('/api/fees', require('./fees/routes'));
app.use('/api/finance', require('./fees/routes')); // Backward compatibility
app.use('/api/hostels', require('./hostel/routes'));

// New modular routes
app.use('/api/academic', require('./academic/routes'));
app.use('/api/student-services', require('./students/routes'));
app.use('/api/faculty-services', require('./faculty/routes'));
app.use('/api/examinations', require('./examinations/routes'));
app.use('/api/library-services', require('./library/routes'));
app.use('/api/laboratory', require('./laboratory/routes'));
app.use('/api/administration', require('./administration/routes'));

// Backward compatibility routes
app.use('/api/courses', require('./academic/routes/courseRoutes'));
app.use('/api/departments', require('./academic/routes/departmentRoutes'));
app.use('/api/classrooms', require('./academic/routes/classroomRoutes'));
app.use('/api/timetable', require('./academic/routes/timetableRoutes'));
app.use('/api/faculty', require('./faculty/routes/facultyRoutes'));
app.use('/api/assignments', require('./faculty/routes/assignmentRoutes'));
app.use('/api/attendance', require('./students/routes/attendanceRoutes'));
app.use('/api/exams', require('./examinations/routes/examRoutes'));
app.use('/api/library', require('./library/routes/libraryRoutes'));
app.use('/api/labs', require('./laboratory/routes/labRoutes'));
app.use('/api/colleges', require('./administration/routes/collegeRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running', 
    environment: process.env.NODE_ENV,
    architecture: 'modular',
    modules: [
      'admissions',
      'fees', 
      'hostel',
      'academic',
      'students',
      'faculty',
      'examinations',
      'library',
      'laboratory',
      'administration',
      'shared'
    ]
  });
});

// Handle undefined routes
app.use('*', (req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: `Route ${req.originalUrl} not found` 
  });
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;
