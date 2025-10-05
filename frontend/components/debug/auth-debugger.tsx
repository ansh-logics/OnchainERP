"use client";

import { useEffect, useState } from 'react';
import { isAuthenticated, getAuthToken, getCurrentUser } from '@/lib/auth';

export const AuthDebugger = () => {
  const [authInfo, setAuthInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const info = {
        isAuthenticated: isAuthenticated(),
        hasAuthToken: !!getAuthToken(),
        authToken: getAuthToken()?.substring(0, 20) + '...' || 'null',
        currentUser: getCurrentUser(),
        allLocalStorageKeys: Object.keys(localStorage),
        tokenKeys: Object.keys(localStorage).filter(key => key.toLowerCase().includes('token')),
      };
      setAuthInfo(info);
    }
  }, []);

  if (!authInfo) return null;

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black text-white text-xs rounded-lg shadow-lg max-w-sm z-50">
      <div className="font-bold mb-2">Auth Debug Info:</div>
      <div>Authenticated: {authInfo.isAuthenticated ? '✅' : '❌'}</div>
      <div>Has Token: {authInfo.hasAuthToken ? '✅' : '❌'}</div>
      <div>Token: {authInfo.authToken}</div>
      <div>User: {authInfo.currentUser?.name || 'null'}</div>
      <div>Token Keys: {authInfo.tokenKeys.join(', ') || 'none'}</div>
    </div>
  );
};
