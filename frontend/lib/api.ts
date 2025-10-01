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

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
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

// Generic error handler
export function handleApiError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}
