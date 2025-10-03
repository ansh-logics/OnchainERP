// API utilities for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardAnalytics {
  totalStudents: number;
  totalFaculty: number;
  revenue: number;
  hostelOccupancy: number;
  totalDepartments: number;
  activeAlerts: number;
  pendingFees: number;
  upcomingExams: number;
}

export interface CollegeProfile {
  id: string;
  name: string;
  shortName: string;
  establishedYear: number;
  affiliatedUniversity?: string;
  collegeType: string;
  registrationNumber: string;
  
  // Address
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPincode: string;
  addressCountry: string;
  
  // Contact
  phone: string;
  email: string;
  website?: string;
  fax?: string;
  
  // Branding
  logo?: string;
  letterhead?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  motto?: string;
  vision?: string;
  mission?: string;
  
  // Infrastructure (optional)
  campusArea?: number;
  totalBuildings?: number;
  totalClassrooms?: number;
  totalLaboratories?: number;
  
  // Setup tracking
  profileCompleted: boolean;
  setupStep: number;
  
  isActive: boolean;
}

export interface CollegeSetupStatus {
  profileCompleted: boolean;
  setupStep: number;
  missingFields: string[];
  college: {
    name: string;
    shortName: string;
  };
}

export interface CollegeStatistics {
  totalDepartments: number;
  totalStudents: number;
  totalFaculty: number;
  establishedYear: number;
  campusArea?: number;
  totalBuildings?: number;
  totalClassrooms?: number;
  totalLaboratories?: number;
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('user.role');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Helper function to handle API responses
async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || `HTTP error! status: ${response.status}`,
        message: data.message
      };
    }
    
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to parse response',
      message: 'Invalid response from server'
    };
  }
}

// Dashboard API calls
export async function fetchDashboardAnalytics(): Promise<ApiResponse<DashboardAnalytics>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/analytics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<DashboardAnalytics>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function fetchCollegeSetupStatus(): Promise<ApiResponse<CollegeSetupStatus>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/colleges/setup-status`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<CollegeSetupStatus>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

// College Profile API calls
export async function fetchCollegeProfile(collegeId?: string): Promise<ApiResponse<CollegeProfile>> {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const id = collegeId || user.collegeId || user.college?.id;
    
    if (!id) {
      return {
        success: false,
        error: 'College ID not found',
        message: 'Unable to identify college'
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/colleges/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<CollegeProfile>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function updateCollegeProfile(
  data: Partial<CollegeProfile>,
  collegeId?: string
): Promise<ApiResponse<CollegeProfile>> {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const id = collegeId || user.collegeId || user.college?.id;
    
    if (!id) {
      return {
        success: false,
        error: 'College ID not found',
        message: 'Unable to identify college'
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/colleges/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<CollegeProfile>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

// College Statistics API call
export async function fetchCollegeStatistics(collegeId?: string): Promise<ApiResponse<CollegeStatistics>> {
  try {
    let id = collegeId;
    
    // If no college ID provided, try to get it from localStorage
    if (!id) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      id = user.collegeId || user.college?.id;
    }
    
    if (!id) {
      return {
        success: false,
        error: 'College ID not found',
        message: 'Unable to identify college'
      };
    }
    
    const response = await fetch(`${API_BASE_URL}/api/colleges/${id}/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<CollegeStatistics>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

// Department API interfaces
export interface Department {
  id: string;
  name: string;
  shortName: string;
  code: string;
  description: string;
  hodId?: string;
  collegeId: string;
  studentsPerSection: number;
  totalSections: number;
  totalIntake: number;
  currentStrength: number;
  programs?: string[];
  isActive: boolean;
  
  // Optional HOD info (populated)
  hod?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  
  // Optional College info (populated)
  college?: {
    id: string;
    name: string;
    shortName: string;
  };
  
  // Additional properties for UI display
  status?: string;
  head?: string;
  location?: string;
  totalStudents?: number;
  totalFaculty?: number;
  totalCourses?: number;
  budget?: number;
  headEmail?: string;
  headPhone?: string;
  establishedYear?: number;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface DepartmentStatistics {
  totalStudents: number;
  totalFaculty: number;
  totalCourses: number;
  totalLabs: number;
  totalSections: number;
  totalSeats: number;
  intake: number;
}

export interface CreateDepartmentData {
  name: string;
  shortName: string;
  code: string;
  description: string;
  college?: string; // College ID for backend
  hod?: string; // HOD ID (renamed from hodId for backend compatibility)
  studentsPerSection: number;
  totalSections: number;
  totalIntake: number;
  currentStrength?: number;
  programs?: string[];
}

// Department API calls
export async function fetchDepartments(): Promise<ApiResponse<Department[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/departments`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<Department[]>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function fetchDepartment(id: string): Promise<ApiResponse<Department>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<Department>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function createDepartment(data: CreateDepartmentData): Promise<ApiResponse<Department>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/departments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<Department>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function updateDepartment(
  id: string,
  data: Partial<CreateDepartmentData>
): Promise<ApiResponse<Department>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<Department>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function deleteDepartment(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/departments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function fetchDepartmentStatistics(id: string): Promise<ApiResponse<DepartmentStatistics>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/departments/${id}/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<DepartmentStatistics>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function bulkImportDepartments(file: File): Promise<ApiResponse<any>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/departments/bulk-import`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    return handleApiResponse<any>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

// User Management API interfaces
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student' | 'faculty' | 'admin' | 'cashier' | 'super_admin';
  studentId?: string;
  facultyId?: string;
  collegeId?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'faculty' | 'admin' | 'cashier';
  phone?: string;
  studentId?: string;
  facultyId?: string;
}

// User Management API calls
export interface PaginatedUsersResponse {
  success: boolean;
  data?: User[];
  count: number;
  total: number;
  page: number;
  totalPages: number;
  limit: number;
  message?: string;
  error?: string;
}

export async function fetchUsers(params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
  isActive?: boolean;
}): Promise<PaginatedUsersResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    
    const url = `${API_BASE_URL}/api/users${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    // Parse response once
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        message: data.message || 'Failed to fetch users',
        count: 0,
        total: 0,
        page: 1,
        totalPages: 1,
        limit: 50
      };
    }
    
    return {
      success: data.success !== false,
      data: data.data,
      count: data.count || 0,
      total: data.total || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1,
      limit: data.limit || 50,
      message: data.message,
      error: data.error
    };
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server',
      count: 0,
      total: 0,
      page: 1,
      totalPages: 1,
      limit: 50
    };
  }
}

export async function fetchUser(id: string): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<User>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function createUser(data: CreateUserData): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<User>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function updateUser(
  id: string,
  data: Partial<CreateUserData>
): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<User>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<void>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function bulkImportUsers(file: File): Promise<ApiResponse<{imported: number; failed: number; errors?: string[]}>> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('authToken');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/users/bulk-import`, {
      method: 'POST',
      headers,
      body: formData
    });
    
    return handleApiResponse<{imported: number; failed: number; errors?: string[]}>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

export async function resetUserPassword(id: string): Promise<ApiResponse<{ tempPassword: string; email: string }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<{ tempPassword: string; email: string }>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to connect to server'
    };
  }
}

// Generic error handler
export function handleApiError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  
  return 'An unexpected error occurred';
}

// Generic API client (axios-like interface)
export const api = {
  async get(url: string, config?: { params?: Record<string, any> }) {
    try {
      const queryString = config?.params 
        ? '?' + new URLSearchParams(config.params).toString()
        : '';
      
      const response = await fetch(`${API_BASE_URL}${url}${queryString}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      throw error;
    }
  },

  async post(url: string, data?: any, config?: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      return { data: responseData, status: response.status };
    } catch (error) {
      throw error;
    }
  },

  async put(url: string, data?: any, config?: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      return { data: responseData, status: response.status };
    } catch (error) {
      throw error;
    }
  },

  async delete(url: string, config?: any) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      const responseData = await response.json();
      return { data: responseData, status: response.status };
    } catch (error) {
      throw error;
    }
  }
};

// ============================================
// STAFF/FACULTY OPERATIONS
// ============================================

// Student Management
export interface StudentData {
  id: string;
  enrollmentNumber: string;
  batch: string;
  program: string;
  currentSemester: number;
  admissionStatus: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  department?: {
    name: string;
    code: string;
  };
}

export async function getStudents(filters?: {
  departmentId?: string;
  batch?: string;
  program?: string;
  search?: string;
}): Promise<ApiResponse<StudentData[]>> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/students?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    return handleApiResponse<StudentData[]>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch students'
    };
  }
}

export async function getStudentById(id: string): Promise<ApiResponse<StudentData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/students/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<StudentData>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch student details'
    };
  }
}

// Fee Collection
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  description: string;
  dueDate?: Date;
  paidDate?: Date;
  paymentMethod?: string;
  student?: {
    id: string;
    name: string;
    enrollmentNumber: string;
  };
}

export interface FeeCollectionStats {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
}

export async function getTransactions(filters?: {
  status?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ data: Transaction[]; total: number; pages: number }>> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/finance/transactions?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    return handleApiResponse<{ data: Transaction[]; total: number; pages: number }>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch transactions'
    };
  }
}

export async function createTransaction(data: {
  student: string;
  amount: number;
  category: string;
  description: string;
  dueDate: string;
  type: 'income';
}): Promise<ApiResponse<Transaction>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/finance/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<Transaction>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to create transaction'
    };
  }
}

export async function approveTransaction(id: string): Promise<ApiResponse<Transaction>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/finance/transactions/${id}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<Transaction>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to approve transaction'
    };
  }
}

export async function getFeeCollectionStats(): Promise<ApiResponse<FeeCollectionStats>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/finance/summary`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<FeeCollectionStats>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch fee statistics'
    };
  }
}

// Exam Management
export interface ExamData {
  id: string;
  examType: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: string;
  course: {
    id: string;
    name: string;
    code: string;
  };
  examHall?: {
    hallName: string;
    hallCode: string;
  };
}

export interface ExamResult {
  id: string;
  studentId: string;
  examId: string;
  marksObtained: number;
  grade?: string;
  remarks?: string;
  student: {
    name: string;
    enrollmentNumber: string;
  };
}

export async function getExams(filters?: {
  courseId?: string;
  examType?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<{ data: ExamData[]; total: number; pages: number }>> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/exams?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    return handleApiResponse<{ data: ExamData[]; total: number; pages: number }>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch exams'
    };
  }
}

export async function createExam(data: {
  courseId: string;
  examType: string;
  examDate: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
}): Promise<ApiResponse<ExamData>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/exams`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<ExamData>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to create exam'
    };
  }
}

export async function addExamResults(examId: string, results: {
  studentId: string;
  marksObtained: number;
  remarks?: string;
}[]): Promise<ApiResponse<ExamResult[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/results`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ results })
    });
    
    return handleApiResponse<ExamResult[]>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to add exam results'
    };
  }
}

export async function getExamResults(examId: string): Promise<ApiResponse<ExamResult[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/exams/${examId}/results`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<ExamResult[]>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch exam results'
    };
  }
}

// Hostel Management
export interface HostelData {
  id: string;
  hostelName: string;
  hostelCode: string;
  hostelType: string;
  gender: 'Male' | 'Female';
  totalCapacity: number;
  currentOccupancy: number;
  address?: string;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  capacity: number;
  currentOccupancy: number;
  status: 'available' | 'occupied' | 'maintenance';
  amenities?: string[];
}

export interface HostelAllocation {
  id: string;
  studentId: string;
  hostelId: string;
  roomId: string;
  allocationType: string;
  status: 'allocated' | 'checked_in' | 'checked_out';
  allocationDate: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  student: {
    name: string;
    enrollmentNumber: string;
  };
  room: {
    roomNumber: string;
    floor: number;
  };
}

export async function getHostels(filters?: {
  hostelType?: string;
  gender?: string;
}): Promise<ApiResponse<HostelData[]>> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/hostels?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    return handleApiResponse<HostelData[]>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch hostels'
    };
  }
}

export async function getHostelRooms(hostelId: string, filters?: {
  status?: string;
  floor?: number;
}): Promise<ApiResponse<HostelRoom[]>> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/api/hostels/${hostelId}/rooms?${params.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );
    
    return handleApiResponse<HostelRoom[]>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch hostel rooms'
    };
  }
}

export async function allocateHostelRoom(data: {
  studentId: string;
  hostelId: string;
  roomId: string;
  allocationType: string;
  allocationDate: string;
}): Promise<ApiResponse<HostelAllocation>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/hostels/allocate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleApiResponse<HostelAllocation>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to allocate hostel room'
    };
  }
}

export async function checkInStudent(hostelId: string, studentId: string): Promise<ApiResponse<HostelAllocation>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hostels/${hostelId}/checkin/${studentId}`,
      {
        method: 'POST',
        headers: getAuthHeaders()
      }
    );
    
    return handleApiResponse<HostelAllocation>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to check in student'
    };
  }
}

export async function checkOutStudent(hostelId: string, studentId: string): Promise<ApiResponse<HostelAllocation>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/hostels/${hostelId}/checkout/${studentId}`,
      {
        method: 'POST',
        headers: getAuthHeaders()
      }
    );
    
    return handleApiResponse<HostelAllocation>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to check out student'
    };
  }
}

export async function getHostelAllocations(hostelId?: string): Promise<ApiResponse<HostelAllocation[]>> {
  try {
    const url = hostelId 
      ? `${API_BASE_URL}/api/hostels/${hostelId}/allocations`
      : `${API_BASE_URL}/api/hostels/allocations`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<HostelAllocation[]>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch allocations'
    };
  }
}

// Staff Dashboard Analytics
export interface StaffDashboardAnalytics {
  totalStudents: number;
  pendingAdmissions: number;
  feeCollectionRate: number;
  hostelOccupancy: number;
  upcomingExams: number;
  recentActivities: {
    id: string;
    action: string;
    timestamp: Date;
    type: string;
    metadata?: Record<string, unknown>;
  }[];
}

export async function getStaffDashboardAnalytics(): Promise<ApiResponse<StaffDashboardAnalytics>> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/analytics`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    return handleApiResponse<StaffDashboardAnalytics>(response);
  } catch (error) {
    return {
      success: false,
      error: 'Network error',
      message: 'Failed to fetch dashboard analytics'
    };
  }
}
