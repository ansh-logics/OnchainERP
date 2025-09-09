/**
 * OnchainERP API Client Service
 * 
 * This service provides a comprehensive API client for the OnchainERP backend
 * based on the FRONTEND_API_CONNECTION_GUIDE.md specifications.
 * 
 * Features:
 * - Centralized API configuration
 * - Automatic token management
 * - Error handling with proper error types
 * - Type-safe API methods
 * - Retry logic for network failures
 * - Request/response logging for debugging
 */

interface ApiError extends Error {
  status?: number;
  code?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  token?: string;
  user?: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'student';
  college?: {
    id: string;
    name: string;
    shortName: string;
  };
  studentProfile?: any;
  facultyProfile?: any;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface CollegeRegistrationData {
  // College Details
  name: string;
  shortName: string;
  establishedYear: number;
  affiliatedUniversity: string;
  collegeType: 'Private' | 'Government';
  phone: string;
  email: string;
  registrationNumber: string;
  
  // Address
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  
  // Infrastructure (Optional)
  campusArea?: number;
  totalBuildings?: number;
  totalClassrooms?: number;
  totalLaboratories?: number;
  libraryTotalBooks?: number;
  
  // Admin User Creation
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPhone: string;
}

interface DepartmentData {
  name: string;
  shortName: string;
  code: string;
  description?: string;
  studentsPerSection?: number;
  totalSections?: number;
  totalIntake?: number;
  programs?: string[];
  sectionsConfig?: {
    maxSections: number;
    studentsPerSection: number;
  };
  rollNumberConfig?: {
    prefix: string;
    startNumber: number;
  };
}

interface CourseData {
  code: string;
  name: string;
  credits: number;
  description?: string;
  department: string; // Department UUID
  semester?: number;
  courseType?: 'Core' | 'Elective' | 'Lab';
  shortName?: string;
  theoryHours?: number;
  labHours?: number;
  tutorialHours?: number;
  prerequisites?: string;
  hasInternalAssessment?: boolean;
  hasFinalExam?: boolean;
  internalMarks?: number;
  finalMarks?: number;
  passingMarks?: number;
  isActive?: boolean;
}

interface FacultyData {
  // User Details
  name: string;
  email: string;
  password: string;
  contactNumber: string;
  
  // Address
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPincode?: string;
  addressCountry?: string;
  
  // Faculty-Specific Required Fields
  employeeId: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Lecturer' | 'Senior Lecturer' | 'Guest Faculty' | 'Visiting Faculty';
  qualification: string;
  joiningDate: string; // YYYY-MM-DD format
  employmentType: 'Permanent' | 'Contract' | 'Part-time' | 'Guest';
  dateOfBirth: string; // YYYY-MM-DD format
  gender: 'Male' | 'Female' | 'Other';
  
  // Department & College
  department: string; // Department UUID
  
  // Optional Fields
  facultyId?: string;
  specialization?: string;
  experience?: number;
  salary?: number;
  bloodGroup?: string;
  maritalStatus?: string;
  personalEmail?: string;
  personalPhone?: string;
  emergencyContact?: string;
  isHOD?: boolean;
  isActive?: boolean;
}

interface StudentData {
  // User Details
  name: string;
  email: string;
  password: string;
  contactNumber: string;
  
  // Address
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressPincode?: string;
  addressCountry?: string;
  
  // Student Identification - REQUIRED
  enrollmentNumber: string;
  batch: string;
  program: string;
  admissionYear: number;
  currentSemester?: number;
  
  // Personal Details - REQUIRED
  dateOfBirth: string; // YYYY-MM-DD format
  gender: 'Male' | 'Female' | 'Other';
  category: 'General' | 'OBC' | 'SC' | 'ST' | 'EWS';
  
  // Department & College
  department: string; // Department UUID
  
  // Guardian Details - REQUIRED
  guardianName: string;
  guardianRelation: 'Father' | 'Mother' | 'Guardian' | 'Other';
  guardianPhone: string;
  guardianEmail?: string;
  guardianOccupation?: string;
  
  // Optional Fields
  studentId?: string;
  rollNumber?: string;
  bloodGroup?: string;
  religion?: string;
  nationality?: string;
  personalEmail?: string;
  personalPhone?: string;
  
  // Additional Address Fields
  permanentAddressStreet?: string;
  permanentAddressCity?: string;
  permanentAddressState?: string;
  permanentAddressPincode?: string;
  permanentAddressCountry?: string;
  
  currentAddressStreet?: string;
  currentAddressCity?: string;
  currentAddressState?: string;
  currentAddressPincode?: string;
  currentAddressCountry?: string;
  
  // Academic
  cgpa?: number;
  admissionStatus?: string;
  isActive?: boolean;
}

export class OnchainERPAPI {
  private baseURL: string;
  private token: string | null;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  constructor(baseURL: string = 'http://localhost:5001/api') {
    this.baseURL = baseURL;
    this.token = this.getStoredToken();
  }

  // Token Management
  private getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearAuth(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  // Generic API call method with retry logic
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers
      },
      ...options
    };

    try {
      console.log(`API Call: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      console.log(`API Response: ${response.status}`, {
        success: data.success,
        hasData: !!data.data,
        hasError: !!data.error
      });

      if (!response.ok) {
        const error = new Error(data.error || data.message || `HTTP ${response.status}`) as ApiError;
        error.status = response.status;
        throw error;
      }

      if (!data.success) {
        const error = new Error(data.error || data.message || 'API call failed') as ApiError;
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error(`API Error: ${url}`, error);
      
      // Handle authentication errors
      if (error.status === 401) {
        this.clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // Retry on network errors
      if (retryCount < this.maxRetries && this.isRetryableError(error)) {
        console.log(`Retrying API call ${retryCount + 1}/${this.maxRetries}`);
        await this.delay(this.retryDelay * (retryCount + 1));
        return this.apiCall(endpoint, options, retryCount + 1);
      }

      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on network errors or server errors (5xx)
    return (
      error.name === 'TypeError' ||
      (error.status >= 500 && error.status < 600) ||
      error.code === 'NETWORK_ERROR'
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Authentication Methods
  async registerCollege(collegeData: CollegeRegistrationData): Promise<ApiResponse> {
    return await this.apiCall('/colleges/register', {
      method: 'POST',
      body: JSON.stringify(collegeData)
    });
  }

  async login(email: string, password: string): Promise<ApiResponse<User>> {
    const result = await this.apiCall<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (result.token) {
      this.setToken(result.token);
    }

    // Store user data
    if (typeof window !== 'undefined' && result.data) {
      localStorage.setItem('user', JSON.stringify(result.data));
    }

    return result;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return await this.apiCall<User>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.apiCall('/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuth();
    }
  }

  // Dashboard Methods
  async getDashboardStats(): Promise<ApiResponse> {
    return await this.apiCall('/admin/dashboard');
  }

  // Department Management
  async createDepartment(departmentData: DepartmentData): Promise<ApiResponse> {
    return await this.apiCall('/departments', {
      method: 'POST',
      body: JSON.stringify(departmentData)
    });
  }

  async getDepartments(): Promise<ApiResponse> {
    return await this.apiCall('/departments');
  }

  async getDepartment(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/departments/${id}`);
  }

  // Course Management
  async createCourse(courseData: CourseData): Promise<ApiResponse> {
    return await this.apiCall('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData)
    });
  }

  async getCourses(): Promise<ApiResponse> {
    return await this.apiCall('/courses');
  }

  async getCourse(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/courses/${id}`);
  }

  // Faculty Management
  async createFaculty(facultyData: FacultyData): Promise<ApiResponse> {
    return await this.apiCall('/faculty', {
      method: 'POST',
      body: JSON.stringify(facultyData)
    });
  }

  async getFaculty(): Promise<ApiResponse> {
    return await this.apiCall('/faculty');
  }

  async getFacultyById(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/faculty/${id}`);
  }

  // Student Management
  async createStudent(studentData: StudentData): Promise<ApiResponse> {
    return await this.apiCall('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async getStudents(): Promise<ApiResponse> {
    return await this.apiCall('/students');
  }

  async getStudent(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/students/${id}`);
  }

  // User Management
  async getUsers(): Promise<ApiResponse> {
    return await this.apiCall('/users');
  }

  async getUser(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/users/${id}`);
  }

  // College Management
  async getColleges(): Promise<ApiResponse> {
    return await this.apiCall('/colleges');
  }

  async getCollege(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/colleges/${id}`);
  }

  // Reports
  async getAttendanceReport(filters?: Record<string, any>): Promise<ApiResponse> {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return await this.apiCall(`/admin/reports/attendance${query}`);
  }

  async getGradesReport(filters?: Record<string, any>): Promise<ApiResponse> {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return await this.apiCall(`/admin/reports/grades${query}`);
  }

  // Finance Management
  async getFinancialSummary(filters?: Record<string, any>): Promise<ApiResponse> {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return await this.apiCall(`/finance/summary${query}`);
  }

  async getTransactions(filters?: Record<string, any>): Promise<ApiResponse> {
    const query = filters ? '?' + new URLSearchParams(filters).toString() : '';
    return await this.apiCall(`/finance/transactions${query}`);
  }

  async createTransaction(transactionData: any): Promise<ApiResponse> {
    return await this.apiCall('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData)
    });
  }

  async getTransaction(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/finance/transactions/${id}`);
  }

  async updateTransaction(id: string, transactionData: any): Promise<ApiResponse> {
    return await this.apiCall(`/finance/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData)
    });
  }

  async approveTransaction(id: string): Promise<ApiResponse> {
    return await this.apiCall(`/finance/transactions/${id}/approve`, {
      method: 'PATCH'
    });
  }

  // Utility Methods
  isAuthenticated(): boolean {
    return !!this.token;
  }

  getAuthToken(): string | null {
    return this.token;
  }

  getCurrentUserFromStorage(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  // Error handling helper
  static handleApiError(error: any): string {
    if (error.status === 401) {
      return 'Authentication failed. Please log in again.';
    }
    if (error.status === 403) {
      return 'You do not have permission to perform this action.';
    }
    if (error.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error.status === 409) {
      return 'This record already exists. Please check and try again.';
    }
    if (error.status >= 500) {
      return 'Server error. Please try again later.';
    }
    return error.message || 'An unexpected error occurred.';
  }
}

// Create and export a singleton instance
export const apiClient = new OnchainERPAPI();

// Export types for use in components
export type {
  ApiResponse,
  User,
  CollegeRegistrationData,
  DepartmentData,
  CourseData,
  FacultyData,
  StudentData,
  ApiError
};
