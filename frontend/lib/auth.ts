// Authentication utilities for real backend integration
export type UserRole = 'student' | 'faculty' | 'admin' | 'cashier' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLogin?: string;
  studentId?: string;
  facultyId?: string;
  collegeId?: string;
  college?: {
    id: string;
    name: string;
    shortName: string;
  };
}

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem('user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      return null;
    }
  }
  return null;
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null && getAuthToken() !== null;
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  
  // Clear all authentication data
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  
  // Optionally redirect to login page
  window.location.href = '/auth/login';
};
