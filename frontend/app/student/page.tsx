"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function StudentPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/auth/login');
      return;
    }
    
    if (currentUser.role === 'student') {
      router.push('/student/dashboard');
    } else {
      // Redirect to correct dashboard based on role
      let redirectPath = '/dashboard';
      
      switch (currentUser.role) {
        case 'admin':
        case 'super_admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'faculty':
          redirectPath = '/staff/dashboard';
          break;
        case 'cashier':
          redirectPath = '/cashier/dashboard';
          break;
        default:
          redirectPath = '/dashboard';
      }
      
      router.push(redirectPath);
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
