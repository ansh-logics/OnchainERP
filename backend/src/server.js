const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger.json');
const errorHandler = require('./middleware/errorHandler');
const { connectDatabases } = require('./config/database');
const { initializeRolesAndPermissions } = require('./utils/setupRoles');

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

// Define routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/colleges', require('./routes/collegeRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/labs', require('./routes/labRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));

// New ERP module routes
app.use('/api/hostels', require('./routes/hostelRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/exams', require('./routes/examRoutes'));
app.use('/api/library', require('./routes/libraryRoutes'));
app.use('/api/timetable', require('./routes/timetableRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running', 
    environment: process.env.NODE_ENV 
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

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = server;
