"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import FacultyAssignments from "@/components/faculty/FacultyAssignments";
import { getCurrentUser } from "@/lib/auth";

export default function FacultyAssignmentsPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'faculty') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout title="Assignments" userRole="faculty">
      <FacultyAssignments />
    </DashboardLayout>
  );
}
