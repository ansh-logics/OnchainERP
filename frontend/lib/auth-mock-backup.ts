// Mock authentication utilities for demo mode
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

// Mock users for demo
const mockUsers: Record<string, User> = {
  'student@yukti.edu': {
    id: '1',
    name: 'Priya Sharma',
    email: 'student@yukti.edu',
    role: 'student',
    phone: '+91 9876543210',
    isActive: true,
    isEmailVerified: true,
    studentId: '1',
    collegeId: '1',
    college: {
      id: '1',
      name: 'Yukti University',
      shortName: 'YU'
    }
  },
  'faculty@yukti.edu': {
    id: '2',
    name: 'Dr. Sarah Johnson',
    email: 'faculty@yukti.edu',
    role: 'faculty',
    phone: '+91 9876543211',
    isActive: true,
    isEmailVerified: true,
    facultyId: '1',
    collegeId: '1',
    college: {
      id: '1',
      name: 'Yukti University',
      shortName: 'YU'
    }
  },
  'admin@yukti.edu': {
    id: '3',
    name: 'Admin User',
    email: 'admin@yukti.edu',
    role: 'admin',
    phone: '+91 9876543212',
    isActive: true,
    isEmailVerified: true,
    collegeId: '1',
    college: {
      id: '1',
      name: 'Yukti University',
      shortName: 'YU'
    }
  }
};

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
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  window.location.href = '/';
};

// Mock login function
export const mockLogin = async (email: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user exists
  const user = mockUsers[email.toLowerCase()];
  
  if (!user) {
    return {
      success: false,
      message: 'Invalid email or password'
    };
  }
  
  // For demo, accept any password except empty
  if (!password || password.trim() === '') {
    return {
      success: false,
      message: 'Password is required'
    };
  }
  
  // Store user and token in localStorage
  const mockToken = `mock_token_${Date.now()}`;
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('authToken', mockToken);
  
  return {
    success: true,
    user
  };
};

// Mock register function (for demo, just creates a new student account)
export const mockRegister = async (userData: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<{ success: boolean; user?: User; message?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  if (userData.password !== userData.confirmPassword) {
    return {
      success: false,
      message: 'Passwords do not match'
    };
  }
  
  if (mockUsers[userData.email.toLowerCase()]) {
    return {
      success: false,
      message: 'User already exists with this email'
    };
  }
  
  // Create new user
  const newUser: User = {
    id: Date.now().toString(),
    name: userData.name,
    email: userData.email,
    role: 'student',
    isActive: true,
    isEmailVerified: false,
    studentId: Date.now().toString(),
    collegeId: '1',
    college: {
      id: '1',
      name: 'Yukti University',
      shortName: 'YU'
    }
  };
  
  // Add to mock users (in real app, this would be saved to database)
  mockUsers[userData.email.toLowerCase()] = newUser;
  
  const mockToken = `mock_token_${Date.now()}`;
  localStorage.setItem('user', JSON.stringify(newUser));
  localStorage.setItem('authToken', mockToken);
  
  return {
    success: true,
    user: newUser
  };
};

// Get demo credentials
export const getDemoCredentials = () => {
  return {
    student: {
      email: 'student@yukti.edu',
      password: 'demo123',
      role: 'Student'
    },
    faculty: {
      email: 'faculty@yukti.edu',
      password: 'demo123',
      role: 'Faculty'
    },
    admin: {
      email: 'admin@yukti.edu',
      password: 'demo123',
      role: 'Admin'
    }
  };
};
