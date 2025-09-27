"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  Home, 
  Users, 
  FileText,
  Settings,
  Bell,
  Building,
  GraduationCap,
  DollarSign,
  BarChart3,
  UserCheck,
  ClipboardList,
  BookOpen,
  Book
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/auth";

interface SidebarProps {
  userRole: UserRole;
}

const getNavigationItems = (role: UserRole) => {
  const baseItems = [
    { name: "Dashboard", href: `/${role}/dashboard`, icon: Home },
    { name: "Profile", href: `/${role}/profile`, icon: Users },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  switch (role) {
    case 'student':
      return [
        { name: "Dashboard", href: "/student/dashboard", icon: Home },
        { name: "Profile", href: "/student/profile", icon: Users },
        { name: "Courses", href: "/student/courses", icon: BookOpen },
        { name: "Assignments", href: "/student/assignments", icon: FileText },
        { name: "Library", href: "/student/library", icon: Book },
        { name: "Fees", href: "/student/fees", icon: CreditCard },
        { name: "Hostel", href: "/student/hostel", icon: Building },
        { name: "Exams", href: "/student/exams", icon: GraduationCap },
        { name: "Notifications", href: "/notifications", icon: Bell },
      ];
    
    case 'staff':
      return [
        { name: "Dashboard", href: "/staff/dashboard", icon: Home },
        { name: "Admissions", href: "/staff/admissions", icon: UserCheck },
        { name: "Fee Collection", href: "/staff/fees", icon: DollarSign },
        { name: "Hostel Management", href: "/staff/hostel", icon: Building },
        { name: "Exam Management", href: "/staff/exams", icon: ClipboardList },
        { name: "Notifications", href: "/notifications", icon: Bell },
      ];
    
    case 'admin':
      return [
        { name: "Dashboard", href: "/admin/dashboard", icon: Home },
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Reports", href: "/admin/reports", icon: BarChart3 },
        { name: "Audit Logs", href: "/admin/logs", icon: FileText },
        { name: "Settings", href: "/settings", icon: Settings },
      ];
    
    default:
      return baseItems;
  }
};

export function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const navigationItems = getNavigationItems(userRole);

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">YuktiERP</h1>
            <p className="text-xs text-gray-500">College Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-11",
                  isActive && "bg-primary text-primary-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Badge variant="outline" className="text-xs">
            v1.0.0
          </Badge>
          <span>MVP Demo</span>
        </div>
      </div>
    </div>
  );
}
