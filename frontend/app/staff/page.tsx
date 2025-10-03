"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default function StaffPage() {
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    if (currentUser.role !== 'staff' && currentUser.role !== 'faculty') {
      // Redirect to correct dashboard based on role
      let redirectPath = '/dashboard';
      
      switch (currentUser.role) {
        case 'admin':
        case 'super_admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'student':
          redirectPath = '/student/dashboard';
          break;
        case 'cashier':
          redirectPath = '/cashier/dashboard';
          break;
        default:
          redirectPath = '/dashboard';
      }
      
      router.push(redirectPath);
      return;
    }
    // Redirect to staff dashboard (for both staff and faculty roles)
    router.push('/staff/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading Staff Dashboard...</p>
      </div>
    </div>
  );
}
