"use client";

import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { UserRole } from "@/lib/auth";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  userRole: UserRole;
}

export function DashboardLayout({ children, title, userRole }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userRole={userRole} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
