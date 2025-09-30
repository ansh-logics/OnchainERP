// Mock authentication system for MVP demo
export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// Mock user data for demo
export const mockUsers: Record<string, User> = {
  'student@yukti.edu': {
    id: '1',
    name: 'Priya Sharma',
    email: 'student@yukti.edu',
    role: 'student',
  },
  'staff@yukti.edu': {
    id: '2',
    name: 'Dr. Rajesh Kumar',
    email: 'staff@yukti.edu',
    role: 'staff',
  },
  'admin@yukti.edu': {
    id: '3',
    name: 'Prof. Sunita Patel',
    email: 'admin@yukti.edu',
    role: 'admin',
  },
};

export const authenticate = (email: string, password: string): User | null => {
  // Mock authentication - in real app, this would call an API
  if (mockUsers[email] && password === 'demo123') {
    return mockUsers[email];
  }
  return null;
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userJson = localStorage.getItem('yukti_user');
  if (userJson) {
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      localStorage.removeItem('yukti_user');
      return null;
    }
  }
  return null;
};

export const setCurrentUser = (user: User | null) => {
  if (typeof window === 'undefined') return;
  
  console.log('setCurrentUser called with:', user);
  
  if (user) {
    try {
      localStorage.setItem('yukti_user', JSON.stringify(user));
      console.log('✅ User successfully set in localStorage:', user);
      
      // Verify it was set correctly
      const storedUser = localStorage.getItem('yukti_user');
      console.log('✅ Verification - stored user:', storedUser);
    } catch (error) {
      console.error('❌ Error setting user in localStorage:', error);
    }
  } else {
    localStorage.removeItem('yukti_user');
    console.log('✅ User removed from localStorage');
  }
};

export const logout = () => {
  setCurrentUser(null);
};
