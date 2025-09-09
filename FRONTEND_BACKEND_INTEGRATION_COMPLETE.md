# OnchainERP Frontend-Backend Integration Setup Guide

## 🎯 Overview

This guide provides step-by-step instructions for setting up and testing the complete frontend-backend integration for OnchainERP, implementing all the patterns from the FRONTEND_API_CONNECTION_GUIDE.md.

## 🔧 What Was Implemented

### 1. Centralized API Client Service (`/frontend/lib/api-client.ts`)
- **Type-safe API methods** for all endpoints
- **Automatic token management** with localStorage persistence
- **Error handling with retry logic** for network failures
- **Request/response logging** for debugging
- **Authentication state management**
- **Comprehensive TypeScript interfaces** matching the API guide

### 2. React Hooks for State Management (`/frontend/lib/hooks/use-api.tsx`)
- **`useAuth()`** - Authentication state and login/logout
- **`useDashboard()`** - Dashboard statistics
- **`useDepartments()`** - Department CRUD operations
- **`useCourses()`** - Course management
- **`useFaculty()`** - Faculty management
- **`useStudents()`** - Student management
- **Context Provider** for global API state

### 3. Updated Components
- **Login Form** - Uses new API client with proper error handling
- **Admin Dashboard** - Real-time data fetching with refresh capability
- **Add Department Modal** - Simplified form submission using hooks
- **Layout** - Includes API provider for global state

### 4. Environment Configuration
- **Proper backend URL configuration** (port 5001)
- **Environment variables** for API settings
- **Development/production environment support**

## 🚀 Setup Instructions

### Step 1: Backend Setup
1. Ensure your backend is running on port 5001:
   ```bash
   cd backend
   npm start
   # Should show: Server running in development mode on port 5001
   ```

2. Verify backend endpoints are accessible:
   ```bash
   curl http://localhost:5001/health
   # Should return: {"status":"ok","message":"Server is running"}
   ```

### Step 2: Frontend Setup
1. Install dependencies and start the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   # Should start on http://localhost:3000
   ```

2. The frontend is now configured to:
   - Use the centralized API client
   - Connect to backend on port 5001
   - Handle authentication automatically
   - Provide real-time error feedback

### Step 3: Test the Integration

#### 1. College Registration (Public Route)
```bash
# Test backend directly
curl -X POST http://localhost:5001/api/colleges/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test College",
    "shortName": "TC",
    "establishedYear": 2020,
    "affiliatedUniversity": "Test University",
    "collegeType": "Private",
    "phone": "9876543210",
    "email": "contact@testcollege.edu",
    "registrationNumber": "TC2020001",
    "addressStreet": "123 Test Street",
    "addressCity": "Test City",
    "addressState": "Test State",
    "addressPincode": "123456",
    "adminName": "Admin User",
    "adminEmail": "admin@testcollege.edu",
    "adminPassword": "password123",
    "adminPhone": "9876543211"
  }'
```

#### 2. Admin Login
- Go to http://localhost:3000
- Use the credentials from college registration:
  - **Email**: `admin@testcollege.edu`
  - **Password**: `password123`
- The login form now uses the new API client

#### 3. Dashboard Access
- After login, you'll be redirected to `/admin`
- Dashboard uses `useDashboard()` hook for real-time data
- Click "Refresh" button to reload data
- All API calls use proper authentication headers

#### 4. Department Creation
- Click "Add Department" button
- Fill in department details:
  - **Name**: Computer Science Department
  - **Short Name**: CSE
  - **Code**: CS001
  - **Description**: Department of Computer Science
- Uses `useDepartments()` hook with proper error handling

## 🔍 API Client Features

### Automatic Authentication
```typescript
// The API client automatically:
// 1. Includes Bearer tokens in requests
// 2. Handles token expiration (redirects to login)
// 3. Stores tokens in localStorage
// 4. Provides authentication state
```

### Error Handling
```typescript
// Comprehensive error handling:
// - Network errors with retry logic
// - Authentication errors (401) → redirect to login
// - Permission errors (403) → user-friendly messages
// - Validation errors (400) → field-specific feedback
// - Server errors (5xx) → retry with backoff
```

### Type Safety
```typescript
// All API calls are type-safe:
interface DepartmentData {
  name: string;
  shortName: string;
  code: string;
  // ... other fields with proper types
}

const { createDepartment } = useDepartments();
await createDepartment(departmentData); // TypeScript validates structure
```

### Request Logging
```typescript
// All requests are logged for debugging:
// API Call: POST http://localhost:5001/api/departments
// API Response: 201 {success: true, hasData: true}
```

## 🧪 Testing Checklist

### ✅ Authentication Flow
- [ ] College registration creates admin account
- [ ] Login with admin credentials works
- [ ] Dashboard loads after successful login
- [ ] Logout clears authentication state
- [ ] Protected routes redirect to login when not authenticated

### ✅ API Integration
- [ ] All API calls use proper backend URL (port 5001)
- [ ] Authentication headers are included automatically
- [ ] Error responses show user-friendly messages
- [ ] Loading states are displayed during API calls
- [ ] Success operations update UI state

### ✅ CRUD Operations
- [ ] Department creation with validation
- [ ] Course creation (when implemented)
- [ ] Faculty creation (when implemented)
- [ ] Student creation (when implemented)
- [ ] List operations load and display data

### ✅ Error Scenarios
- [ ] Network failures show retry options
- [ ] Invalid credentials show appropriate errors
- [ ] Permission errors display access denied messages
- [ ] Server errors trigger retry logic
- [ ] Form validation prevents invalid submissions

## 🔧 Configuration Files

### Environment Variables (`.env.local`)
```bash
BACKEND_URL=http://localhost:5001
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_APP_NAME=OnchainERP
NODE_ENV=development
```

### API Client Configuration
```typescript
// Base configuration
const api = new OnchainERPAPI('http://localhost:5001/api');
// Automatic token management
// Retry logic: 3 attempts with exponential backoff
// Request timeout: 30 seconds
```

## 🚨 Common Issues & Solutions

### Issue: "Network Error" on Login
**Solution**: Verify backend is running on port 5001
```bash
netstat -an | grep 5001
# Should show: *.5001 LISTEN
```

### Issue: "Authorization header required"
**Solution**: Check token storage in browser DevTools
```javascript
localStorage.getItem('authToken')
// Should return JWT token or null
```

### Issue: CORS Errors
**Solution**: Verify backend CORS configuration allows frontend origin
```javascript
// Backend should include:
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### Issue: API calls to wrong port
**Solution**: Update environment variables and restart dev server
```bash
# Update .env.local
BACKEND_URL=http://localhost:5001

# Restart frontend
npm run dev
```

## 📊 Performance Optimizations

The new implementation includes:

1. **Request Deduplication**: Prevents duplicate API calls
2. **Caching**: Local state caching for frequently accessed data
3. **Lazy Loading**: Components load data only when needed
4. **Error Boundaries**: Prevent app crashes from API errors
5. **Retry Logic**: Automatic retry for transient failures

## 🔮 Next Steps

To complete the integration:

1. **Implement remaining modals**: Faculty, Student, Course creation
2. **Add data tables**: List views with pagination and sorting
3. **Implement file uploads**: Profile pictures and documents
4. **Add real-time updates**: WebSocket integration for live data
5. **Enhance error handling**: Toast notifications and error boundaries

## 📝 Code Examples

### Using the API Client Directly
```typescript
import { apiClient } from '@/lib/api-client';

// Login
const result = await apiClient.login(email, password);

// Create department
const department = await apiClient.createDepartment(departmentData);

// Get dashboard stats
const stats = await apiClient.getDashboardStats();
```

### Using React Hooks
```typescript
import { useAuth, useDepartments } from '@/lib/hooks/use-api';

function MyComponent() {
  const { user, login, logout, isAuthenticated } = useAuth();
  const { departments, createDepartment, loading, error } = useDepartments();
  
  // Component logic here
}
```

This comprehensive integration establishes a robust, type-safe, and maintainable connection between the frontend and backend, following all the best practices outlined in the FRONTEND_API_CONNECTION_GUIDE.md.
