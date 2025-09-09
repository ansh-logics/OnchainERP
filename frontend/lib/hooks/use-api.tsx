/**
 * React Hook for OnchainERP API Integration
 * 
 * This hook provides a clean interface for components to interact with the API
 * and manage authentication state.
 */

'use client';

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { apiClient, OnchainERPAPI, type User, type ApiResponse } from '@/lib/api-client';

interface ApiContextType {
  api: OnchainERPAPI;
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<User>>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Create API Context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// API Provider Component
export function ApiProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!apiClient.isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.getCurrentUser();
      setUser(response.data || null);
      setError(null);
    } catch (err: any) {
      console.error('Failed to refresh user:', err);
      setError(OnchainERPAPI.handleApiError(err));
      // Don't clear auth here - let the apiClient handle it
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<ApiResponse<User>> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiClient.login(email, password);
      setUser(result.data || null);
      
      return result;
    } catch (err: any) {
      const errorMessage = OnchainERPAPI.handleApiError(err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  // Initialize user on mount
  useEffect(() => {
    const initializeAuth = async () => {
      // Try to get user from localStorage first
      const storedUser = apiClient.getCurrentUserFromStorage();
      if (storedUser && apiClient.isAuthenticated()) {
        setUser(storedUser);
        
        // Verify token is still valid by fetching fresh user data
        try {
          const response = await apiClient.getCurrentUser();
          setUser(response.data || null);
        } catch (err) {
          console.error('Token validation failed:', err);
          apiClient.clearAuth();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const contextValue: ApiContextType = {
    api: apiClient,
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    clearError,
    refreshUser,
  };

  return (
    <ApiContext.Provider value={contextValue}>
      {children}
    </ApiContext.Provider>
  );
}

// Hook to use API context
export function useApi(): ApiContextType {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

// Individual hooks for specific API operations
export function useAuth() {
  const { user, loading, error, isAuthenticated, login, logout, clearError, refreshUser } = useApi();
  
  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    clearError,
    refreshUser,
  };
}

// Hook for dashboard data
export function useDashboard() {
  const { api } = useApi();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDashboardStats();
      setDashboardData(response.data);
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboardData, loading, error, refetch: fetchDashboard };
}

// Hook for departments
export function useDepartments() {
  const { api } = useApi();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getDepartments();
      setDepartments(response.data || []);
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createDepartment = useCallback(async (departmentData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createDepartment(departmentData);
      await fetchDepartments(); // Refresh list
      return response;
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchDepartments]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return { 
    departments, 
    loading, 
    error, 
    createDepartment,
    refetch: fetchDepartments 
  };
}

// Hook for courses
export function useCourses() {
  const { api } = useApi();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getCourses();
      setCourses(response.data || []);
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createCourse = useCallback(async (courseData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createCourse(courseData);
      await fetchCourses(); // Refresh list
      return response;
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchCourses]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return { 
    courses, 
    loading, 
    error, 
    createCourse,
    refetch: fetchCourses 
  };
}

// Hook for faculty
export function useFaculty() {
  const { api } = useApi();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getFaculty();
      setFaculty(response.data || []);
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createFaculty = useCallback(async (facultyData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createFaculty(facultyData);
      await fetchFaculty(); // Refresh list
      return response;
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchFaculty]);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  return { 
    faculty, 
    loading, 
    error, 
    createFaculty,
    refetch: fetchFaculty 
  };
}

// Hook for students
export function useStudents() {
  const { api } = useApi();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getStudents();
      setStudents(response.data || []);
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [api]);

  const createStudent = useCallback(async (studentData: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.createStudent(studentData);
      await fetchStudents(); // Refresh list
      return response;
    } catch (err: any) {
      setError(OnchainERPAPI.handleApiError(err));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [api, fetchStudents]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { 
    students, 
    loading, 
    error, 
    createStudent,
    refetch: fetchStudents 
  };
}
