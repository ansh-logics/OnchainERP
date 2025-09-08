# OnchainERP Frontend API Connection Guide

## 🎯 **Complete API Reference & Best Practices**

This guide provides comprehensive instructions for connecting the frontend to the OnchainERP API, including all the lessons learned from debugging and testing the backend endpoints.

---

## 📋 **Table of Contents**

1. [API Base Configuration](#api-base-configuration)
2. [Authentication Flow](#authentication-flow)
3. [Complete Endpoint Reference](#complete-endpoint-reference)
4. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
5. [Error Handling Patterns](#error-handling-patterns)
6. [Field Mapping Reference](#field-mapping-reference)
7. [Working Code Examples](#working-code-examples)

---

## 🔧 **API Base Configuration**

### Base URL
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

### Required Headers
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // Required for protected routes
};
```

---

## 🔐 **Authentication Flow**

### 1. College Registration (Public Route)
**Endpoint:** `POST /api/colleges/register`

```javascript
const registerCollege = async (collegeData) => {
  const response = await fetch(`${API_BASE_URL}/colleges/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // College Details
      name: "Your College Name",
      shortName: "YCN",
      establishedYear: 2020,
      affiliatedUniversity: "University Name",
      collegeType: "Private", // or "Government"
      phone: "9876543210",
      email: "contact@yourcollege.edu",
      registrationNumber: "REG001",
      
      // Address
      addressStreet: "123 Main Street",
      addressCity: "City Name",
      addressState: "State Name",
      addressPincode: "123456",
      
      // Infrastructure (Optional)
      campusArea: 25.5,
      totalBuildings: 5,
      totalClassrooms: 50,
      totalLaboratories: 15,
      libraryTotalBooks: 10000,
      
      // Admin User Creation
      adminName: "Admin Full Name",
      adminEmail: "admin@yourcollege.edu",
      adminPassword: "securepassword123",
      adminPhone: "9876543211"
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Store college ID and admin email for login
    const collegeId = result.data.college.id;
    const adminEmail = result.data.admin.email;
    return { collegeId, adminEmail };
  }
  
  throw new Error(result.error);
};
```

### 2. Admin Login
**Endpoint:** `POST /api/auth/login`

```javascript
const loginAdmin = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    // Store token for subsequent API calls
    const token = result.token;
    const user = result.data;
    
    // Store in localStorage or state management
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { token, user };
  }
  
  throw new Error(result.error);
};
```

### 3. Get Current User
**Endpoint:** `GET /api/auth/me`

```javascript
const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

---

## 📚 **Complete Endpoint Reference**

### Admin Dashboard
**Endpoint:** `GET /api/admin/dashboard`
**Auth Required:** Yes

```javascript
const getDashboardStats = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### Department Management

#### Create Department
**Endpoint:** `POST /api/departments`
**Auth Required:** Yes

```javascript
const createDepartment = async (token, departmentData) => {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: "Computer Science Department",
      shortName: "CSE",
      code: "CS001", // Must be unique globally
      description: "Department of Computer Science and Engineering",
      college: "college-uuid-here", // Will auto-fill from user context
      studentsPerSection: 60,
      totalSections: 4,
      totalIntake: 240,
      currentStrength: 0,
      programs: ["B.Tech", "M.Tech", "PhD"],
      sectionsConfig: {
        maxSections: 4,
        studentsPerSection: 60
      },
      rollNumberConfig: {
        prefix: "CS",
        startNumber: 1
      }
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    return result.data; // Contains department ID
  }
  
  throw new Error(result.error);
};
```

#### Get Departments
**Endpoint:** `GET /api/departments`
**Auth Required:** Yes

```javascript
const getDepartments = async (token) => {
  const response = await fetch(`${API_BASE_URL}/departments`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};
```

### Course Management

#### Create Course
**Endpoint:** `POST /api/courses`
**Auth Required:** Yes

```javascript
const createCourse = async (token, courseData) => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      code: "CS101", // Must be unique
      name: "Introduction to Computer Science",
      credits: 3,
      description: "Basic computer science concepts",
      college: "college-uuid-here", // Optional, will auto-fill
      department: "department-uuid-here", // REQUIRED: Use department ID
      semester: 1,
      courseType: "Core", // or "Elective", "Lab"
      
      // Optional fields
      shortName: "Intro CS",
      theoryHours: 45,
      labHours: 30,
      tutorialHours: 15,
      prerequisites: "None",
      hasInternalAssessment: true,
      hasFinalExam: true,
      internalMarks: 40,
      finalMarks: 60,
      passingMarks: 40,
      isActive: true
    })
  });
  
  return await response.json();
};
```

### Faculty Management

#### Create Faculty
**Endpoint:** `POST /api/faculty`
**Auth Required:** Yes

```javascript
const createFaculty = async (token, facultyData) => {
  const response = await fetch(`${API_BASE_URL}/faculty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      // User Details
      name: "Dr. John Smith",
      email: "john.smith@college.edu",
      password: "securepassword123",
      contactNumber: "+1234567890", // Maps to 'phone' in database
      
      // Address
      addressStreet: "123 Faculty Street",
      addressCity: "City Name",
      addressState: "State Name",
      addressPincode: "123456",
      addressCountry: "India",
      
      // Faculty-Specific Required Fields
      employeeId: "EMP001", // REQUIRED: Must be unique
      designation: "Assistant Professor", // REQUIRED: Must be valid enum
      qualification: "PhD in Computer Science", // REQUIRED
      joiningDate: "2024-01-15", // REQUIRED: Format YYYY-MM-DD
      employmentType: "Permanent", // REQUIRED: Permanent/Contract/Part-time/Guest
      dateOfBirth: "1985-06-15", // REQUIRED: Format YYYY-MM-DD
      gender: "Male", // REQUIRED: Male/Female/Other
      
      // Department & College
      department: "department-uuid-here", // REQUIRED: Use department ID
      college: "college-uuid-here", // Optional, will auto-fill
      
      // Optional Fields
      facultyId: "FAC001",
      specialization: "Machine Learning",
      experience: 5,
      salary: 75000.00,
      bloodGroup: "O+",
      maritalStatus: "Married",
      personalEmail: "john.personal@gmail.com",
      personalPhone: "+9876543210",
      emergencyContact: "+9876543211",
      isHOD: false,
      isActive: true
    })
  });
  
  return await response.json();
};
```

### Student Management

#### Create Student
**Endpoint:** `POST /api/students`
**Auth Required:** Yes

```javascript
const createStudent = async (token, studentData) => {
  const response = await fetch(`${API_BASE_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      // User Details
      name: "Jane Doe",
      email: "jane.doe@college.edu",
      password: "securepassword123",
      contactNumber: "+1234567891", // Maps to 'phone' in database
      
      // Address
      addressStreet: "456 Student Street",
      addressCity: "City Name",
      addressState: "State Name",
      addressPincode: "654321",
      addressCountry: "India",
      
      // Student Identification - REQUIRED
      enrollmentNumber: "ENR2024001", // REQUIRED: Must be unique
      batch: "2024-2028", // REQUIRED
      program: "B.Tech", // REQUIRED
      admissionYear: 2024, // REQUIRED
      currentSemester: 1,
      
      // Personal Details - REQUIRED
      dateOfBirth: "2005-03-20", // REQUIRED: Format YYYY-MM-DD
      gender: "Female", // REQUIRED: Male/Female/Other
      category: "General", // REQUIRED: General/OBC/SC/ST/EWS
      
      // Department & College
      department: "department-uuid-here", // REQUIRED: Use department ID
      college: "college-uuid-here", // Optional, will auto-fill
      
      // Guardian Details - REQUIRED
      guardianName: "John Doe Sr.", // REQUIRED
      guardianRelation: "Father", // REQUIRED: Father/Mother/Guardian/Other
      guardianPhone: "+9876543211", // REQUIRED
      guardianEmail: "guardian@gmail.com",
      guardianOccupation: "Engineer",
      
      // Optional Fields
      studentId: "STU001",
      rollNumber: "CS001", // Auto-generated if not provided
      bloodGroup: "B+",
      religion: "Hindu",
      nationality: "Indian",
      personalEmail: "jane.personal@gmail.com",
      personalPhone: "+9876543212",
      
      // Permanent Address
      permanentAddressStreet: "789 Home Street",
      permanentAddressCity: "Home City",
      permanentAddressState: "Home State",
      permanentAddressPincode: "789012",
      permanentAddressCountry: "India",
      
      // Current Address (if different)
      currentAddressStreet: "456 Student Street",
      currentAddressCity: "City Name",
      currentAddressState: "State Name",
      currentAddressPincode: "654321",
      currentAddressCountry: "India",
      
      // Academic
      cgpa: 0.0,
      admissionStatus: "enrolled",
      isActive: true
    })
  });
  
  return await response.json();
};
```

---

## ⚠️ **Common Pitfalls & Solutions**

### 1. **Authentication Issues**
**Problem:** "Not authorized to access this route"
```javascript
// ❌ Wrong - Missing or invalid token
fetch('/api/departments', {
  method: 'GET'
});

// ✅ Correct - Include valid Bearer token
fetch('/api/departments', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${validToken}`
  }
});
```

### 2. **Department ID Issues**
**Problem:** "Department 'uuid' not found in college"
```javascript
// ❌ Wrong - Using department name instead of ID
{
  "department": "Computer Science Department"
}

// ✅ Correct - Use the actual UUID returned from department creation
{
  "department": "f113022e-bb2b-44a8-9693-add0ddc904ed"
}
```

### 3. **Field Mapping Issues**
**Problem:** "column user.contactNumber does not exist"
```javascript
// ❌ Wrong - Database uses 'phone', not 'contactNumber'
// This is handled internally, but be aware for responses

// ✅ Correct - Use 'contactNumber' in API calls (maps to 'phone')
{
  "contactNumber": "+1234567890"
}
```

### 4. **Required Field Validation**
**Problem:** "Validation error" or missing required fields
```javascript
// ❌ Wrong - Missing required fields
const facultyData = {
  name: "John Doe",
  email: "john@test.com"
  // Missing: employeeId, designation, qualification, etc.
};

// ✅ Correct - Include all required fields
const facultyData = {
  name: "Dr. John Smith",
  email: "john.smith@college.edu",
  password: "password123",
  contactNumber: "+1234567890",
  employeeId: "EMP001", // REQUIRED
  designation: "Assistant Professor", // REQUIRED
  qualification: "PhD", // REQUIRED
  joiningDate: "2024-01-15", // REQUIRED
  employmentType: "Permanent", // REQUIRED
  dateOfBirth: "1985-06-15", // REQUIRED
  gender: "Male", // REQUIRED
  department: "valid-department-uuid" // REQUIRED
};
```

### 5. **Enum Validation Issues**
**Problem:** Invalid enum values causing validation errors
```javascript
// ❌ Wrong - Invalid enum values
{
  "designation": "Teacher", // Invalid
  "employmentType": "Full-time", // Invalid
  "gender": "M", // Invalid
  "category": "Open" // Invalid
}

// ✅ Correct - Valid enum values
{
  "designation": "Assistant Professor", // Valid: Professor/Associate Professor/Assistant Professor/Lecturer/etc.
  "employmentType": "Permanent", // Valid: Permanent/Contract/Part-time/Guest
  "gender": "Male", // Valid: Male/Female/Other
  "category": "General" // Valid: General/OBC/SC/ST/EWS
}
```

### 6. **Date Format Issues**
**Problem:** Invalid date format causing validation errors
```javascript
// ❌ Wrong - Invalid date formats
{
  "dateOfBirth": "15/06/1985", // Wrong format
  "joiningDate": "2024-1-15" // Wrong format
}

// ✅ Correct - Use YYYY-MM-DD format
{
  "dateOfBirth": "1985-06-15",
  "joiningDate": "2024-01-15"
}
```

---

## 🚨 **Error Handling Patterns**

### Standard Error Response Format
```javascript
{
  "success": false,
  "error": "Error message here"
}
```

### Comprehensive Error Handling
```javascript
const apiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      // Handle HTTP errors
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!data.success) {
      // Handle API-level errors
      throw new Error(data.error || 'Unknown API error');
    }
    
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Please check your connection');
    }
    
    // Handle JSON parsing errors
    if (error.name === 'SyntaxError') {
      throw new Error('Invalid response format from server');
    }
    
    // Re-throw other errors
    throw error;
  }
};
```

### Error Types & Solutions
```javascript
const handleApiError = (error) => {
  const errorMessage = error.message.toLowerCase();
  
  if (errorMessage.includes('not authorized')) {
    // Redirect to login
    window.location.href = '/login';
    return;
  }
  
  if (errorMessage.includes('validation error')) {
    // Show field validation errors
    showValidationErrors(error.details);
    return;
  }
  
  if (errorMessage.includes('not found')) {
    // Handle resource not found
    showNotFoundError();
    return;
  }
  
  if (errorMessage.includes('network')) {
    // Handle network issues
    showNetworkError();
    return;
  }
  
  // Generic error handling
  showGenericError(error.message);
};
```

---

## 🗂️ **Field Mapping Reference**

### User Model Fields
| Frontend Field | Database Field | Required | Type | Notes |
|----------------|----------------|----------|------|-------|
| `contactNumber` | `phone` | No | String | Maps automatically |
| `name` | `name` | Yes | String | Max 50 chars |
| `email` | `email` | Yes | String | Must be valid email |
| `password` | `password` | Yes | String | Min 6 chars |
| `role` | `role` | Yes | Enum | Auto-set by endpoint |

### Faculty Model Required Fields
| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| `employeeId` | String | Yes | Must be unique |
| `designation` | Enum | Yes | Professor, Associate Professor, Assistant Professor, Lecturer, Senior Lecturer, Guest Faculty, Visiting Faculty |
| `qualification` | String | Yes | Any string |
| `joiningDate` | Date | Yes | YYYY-MM-DD format |
| `employmentType` | Enum | Yes | Permanent, Contract, Part-time, Guest |
| `dateOfBirth` | Date | Yes | YYYY-MM-DD format |
| `gender` | Enum | Yes | Male, Female, Other |

### Student Model Required Fields
| Field | Type | Required | Valid Values |
|-------|------|----------|--------------|
| `enrollmentNumber` | String | Yes | Must be unique |
| `batch` | String | Yes | Any string (e.g., "2024-2028") |
| `program` | String | Yes | Any string (e.g., "B.Tech") |
| `admissionYear` | Integer | Yes | Valid year |
| `dateOfBirth` | Date | Yes | YYYY-MM-DD format |
| `gender` | Enum | Yes | Male, Female, Other |
| `category` | Enum | Yes | General, OBC, SC, ST, EWS |
| `guardianName` | String | Yes | Any string |
| `guardianRelation` | Enum | Yes | Father, Mother, Guardian, Other |
| `guardianPhone` | String | Yes | Valid phone number |

---

## 💡 **Working Code Examples**

### Complete Frontend Service Class
```javascript
class OnchainERPAPI {
  constructor(baseURL = 'http://localhost:5001/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }
  
  // Set authentication token
  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }
  
  // Clear authentication
  clearAuth() {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
  
  // Generic API call method
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }
      
      if (!data.success) {
        throw new Error(data.error || 'API call failed');
      }
      
      return data;
    } catch (error) {
      if (error.message.includes('not authorized')) {
        this.clearAuth();
        window.location.href = '/login';
      }
      throw error;
    }
  }
  
  // Authentication methods
  async registerCollege(collegeData) {
    return await this.apiCall('/colleges/register', {
      method: 'POST',
      body: JSON.stringify(collegeData)
    });
  }
  
  async login(email, password) {
    const result = await this.apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }
  
  async getCurrentUser() {
    return await this.apiCall('/auth/me');
  }
  
  async logout() {
    try {
      await this.apiCall('/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuth();
    }
  }
  
  // Dashboard
  async getDashboardStats() {
    return await this.apiCall('/admin/dashboard');
  }
  
  // Department methods
  async createDepartment(departmentData) {
    return await this.apiCall('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData)
    });
  }
  
  async getDepartments() {
    return await this.apiCall('/departments');
  }
  
  // Course methods
  async createCourse(courseData) {
    return await this.apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }
  
  async getCourses() {
    return await this.apiCall('/courses');
  }
  
  // Faculty methods
  async createFaculty(facultyData) {
    return await this.apiCall('/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    });
  }
  
  async getFaculty() {
    return await this.apiCall('/faculty');
  }
  
  // Student methods
  async createStudent(studentData) {
    return await this.apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }
  
  async getStudents() {
    return await this.apiCall('/students');
  }
}

// Usage example
const api = new OnchainERPAPI();

// Register college and login
try {
  const collegeResult = await api.registerCollege({
    name: "Test College",
    // ... other college data
  });
  
  const loginResult = await api.login(
    collegeResult.data.admin.email,
    "password123"
  );
  
  console.log('Logged in successfully:', loginResult.data);
  
  // Now you can make authenticated calls
  const departments = await api.getDepartments();
  console.log('Departments:', departments.data);
  
} catch (error) {
  console.error('Error:', error.message);
}
```

### React Hook Example
```javascript
import { useState, useEffect } from 'react';

const useOnchainERP = () => {
  const [api] = useState(() => new OnchainERPAPI());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (api.token) {
          const userData = await api.getCurrentUser();
          setUser(userData.data);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        api.clearAuth();
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [api]);
  
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.login(email, password);
      setUser(result.data);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  
  return {
    api,
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};

export default useOnchainERP;
```

---

## 🎯 **Testing Checklist**

Before deploying your frontend integration, verify:

### ✅ Authentication Flow
- [ ] College registration works with all required fields
- [ ] Admin login returns valid JWT token
- [ ] Token is properly stored and included in requests
- [ ] Protected routes reject requests without valid tokens
- [ ] Token refresh/logout works correctly

### ✅ CRUD Operations
- [ ] Department creation with valid college association
- [ ] Course creation with valid department UUID (not name)
- [ ] Faculty creation with all required fields and proper enums
- [ ] Student creation with all required fields and proper enums
- [ ] List operations return properly formatted data

### ✅ Error Handling
- [ ] Network errors are caught and handled gracefully
- [ ] API errors show meaningful messages to users
- [ ] Validation errors highlight specific fields
- [ ] Authentication errors redirect to login
- [ ] Loading states are shown during API calls

### ✅ Data Validation
- [ ] Required fields are validated before API calls
- [ ] Date fields use YYYY-MM-DD format
- [ ] Enum fields use valid values
- [ ] Email fields are properly validated
- [ ] Phone numbers are in correct format

---

## 🚀 **Performance Tips**

1. **Cache Department/College Data**: These rarely change, cache them locally
2. **Batch API Calls**: Group related operations when possible
3. **Implement Pagination**: For large lists of students/faculty
4. **Use Loading States**: Always show loading indicators
5. **Debounce Search**: Avoid excessive API calls during search
6. **Error Boundaries**: Implement React error boundaries for API failures

---

## 📞 **Support & Troubleshooting**

If you encounter issues not covered in this guide:

1. **Check Server Logs**: Look at the backend console for detailed error messages
2. **Verify Database State**: Use PostgreSQL queries to check data integrity
3. **Test with Postman**: Isolate frontend vs backend issues
4. **Check Network Tab**: Inspect actual HTTP requests and responses
5. **Validate JWT Token**: Ensure token hasn't expired

---

## 🔄 **API Status**

**Current Status:** ✅ **ALL ENDPOINTS WORKING (7/7)**

- ✅ College Registration
- ✅ Admin Authentication  
- ✅ Admin Dashboard
- ✅ Department Management
- ✅ Course Management
- ✅ Faculty Management
- ✅ Student Management

**Last Updated:** September 8, 2025
**Backend Version:** v2.0
**Database:** PostgreSQL + MongoDB (Hybrid)

---

*This guide is based on extensive testing and debugging of the OnchainERP API. All examples have been verified to work with the current backend implementation.*
