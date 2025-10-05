"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import StudentAssignments from "@/components/students/StudentAssignments";
import { getCurrentUser } from "@/lib/auth";

export default function StudentAssignmentsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout title="Assignments" userRole="student">
      <StudentAssignments />
    </DashboardLayout>
  );
}
