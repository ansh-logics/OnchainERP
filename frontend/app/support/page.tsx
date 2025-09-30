"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, UserRole } from "@/lib/auth";

export default function SupportPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout title="Support" userRole={user.role as UserRole}>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
            <CardDescription>Get help and contact support</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This feature is coming soon in the full version.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
