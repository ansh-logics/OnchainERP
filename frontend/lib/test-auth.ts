/**
 * Quick Auth Fix for Payment Testing
 * This ensures the user has a valid auth token for testing payments
 */

// Test student credentials (should match seeded data)
const TEST_CREDENTIALS = {
  email: 'student.cs.2024.001@student.teccollege.edu.in',
  password: 'password123' // Default password from seeded data
};

export const loginWithTestCredentials = async () => {
  try {
    console.log('🔐 Attempting login with test credentials...');
    
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    const data = await response.json();
    
    if (response.ok && data.success && data.token) {
      // Store the real JWT token
      localStorage.setItem('authToken', data.token);
      
      // Store user data
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      console.log('✅ Successfully logged in as:', data.user?.name);
      console.log('🎟️ JWT token stored');
      return { success: true, user: data.user, token: data.token };
    } else {
      console.error('❌ Login failed:', data.message || data.error);
      return { success: false, error: data.message || data.error };
    }
  } catch (error: any) {
    console.error('❌ Login request failed:', error);
    return { success: false, error: error.message || 'Login request failed' };
  }
};

export const ensureTestAuth = async () => {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not available' };
  }
  
  // Check if user already has auth
  const existingToken = localStorage.getItem('authToken');
  if (existingToken) {
    console.log('✅ Auth token already exists');
    return { success: true, existing: true };
  }

  // Try to login with test credentials
  const result = await loginWithTestCredentials();
  return { ...result, existing: false };
};

export const clearTestAuth = () => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  console.log('🗑️ Test auth cleared');
};

export const getTestAuthStatus = () => {
  if (typeof window === 'undefined') return null;
  
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('user');
  
  return {
    hasToken: !!token,
    hasUser: !!user,
    token: token?.substring(0, 20) + '...' || 'none',
    user: user ? JSON.parse(user) : null,
  };
};
