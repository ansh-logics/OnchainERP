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
  Book,
  Calendar,
  Upload,
  Shield,
  RefreshCw,
  School,
  MapPin,
  BedDouble,
  Library,
  CalendarCheck,
  Import
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/auth";

interface SidebarProps {
  userRole: UserRole;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
  category?: string;
}

const getNavigationItems = (role: UserRole): NavigationItem[] => {
  // Use faculty role directly now that we have faculty routes
  const routeRole = role;
  
  const baseItems = [
    { name: "Dashboard", href: routeRole === 'faculty' ? '/faculty' : `/${routeRole}/dashboard`, icon: Home },
    { name: "Profile", href: `/${routeRole}/profile`, icon: Users },
    { name: "Notifications", href: "/notifications", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  switch (role) {
    case 'student':
      return [
        { name: "Dashboard", href: "/student/dashboard", icon: Home },
        { name: "Profile", href: "/student/profile", icon: Users },
        { name: "My Attendance", href: "/student/attendance", icon: CalendarCheck },
        { name: "Courses", href: "/student/courses", icon: BookOpen },
        { name: "Assignments", href: "/student/assignments", icon: FileText },
        { name: "Library", href: "/student/library", icon: Book },
        { name: "Fees", href: "/student/fees", icon: CreditCard },
        { name: "Hostel", href: "/student/hostel", icon: Building },
        { name: "Exams", href: "/student/exams", icon: GraduationCap },
        { name: "Notifications", href: "/notifications", icon: Bell },
      ];
    
    case 'faculty':
      return [
        { name: "Dashboard", href: "/staff/dashboard", icon: Home },
        { name: "Attendance", href: "/staff/attendance", icon: CalendarCheck },
        { name: "Assignments", href: "/staff/assignments", icon: FileText },
        { name: "Substitutions", href: "/staff/substitutions", icon: RefreshCw },
        { name: "Admissions", href: "/staff/admissions", icon: UserCheck },
        { name: "Student Fees", href: "/staff/fees", icon: DollarSign },
        { name: "Hostel Management", href: "/staff/hostel", icon: Building },
        { name: "Exam Management", href: "/staff/exams", icon: ClipboardList },
        { name: "Notifications", href: "/notifications", icon: Bell },
      ];
    
    case 'admin':
      return [
        { name: "Dashboard", href: "/admin/dashboard", icon: Home },
        
        // SETUP & CONFIGURATION
        { name: "College Profile", href: "/admin/college-profile", icon: School, category: "Setup & Configuration" },
        { name: "Academic Calendar", href: "/admin/academic-calendar", icon: Calendar, category: "Setup & Configuration" },
        { name: "Department Management", href: "/admin/departments", icon: Building, category: "Setup & Configuration" },
        { name: "Fee Structure", href: "/admin/fee-structure", icon: DollarSign, category: "Setup & Configuration" },
        { name: "Hostel Configuration", href: "/admin/hostel-config", icon: BedDouble, category: "Setup & Configuration" },

        // USER MANAGEMENT  
        { name: "User Management", href: "/admin/users", icon: Users, category: "User Management" },
        { name: "User Permissions", href: "/admin/permissions", icon: Shield, category: "User Management" },
        { name: "Reset Passwords", href: "/admin/reset-passwords", icon: RefreshCw, category: "User Management" },

        // MODULE MANAGEMENT
        { name: "Admissions", href: "/admin/admissions", icon: GraduationCap, category: "Module Management" },
        { name: "Faculty Substitutions", href: "/admin/substitutions", icon: RefreshCw, category: "Module Management" },
        { name: "Fee Management", href: "/admin/fee-management", icon: DollarSign, category: "Module Management" },
        { name: "Fees & Payments", href: "/admin/fees-payments", icon: CreditCard, category: "Module Management" },
        { name: "Hostel Allocation", href: "/admin/hostel-allocation", icon: Building, category: "Module Management" },
        { name: "Exam scheduling", href: "/admin/exam-scheduling", icon: ClipboardList, category: "Module Management" },
        { name: "Library Management", href: "/admin/library-management", icon: Library, category: "Module Management" },

        // REPORTS & MONITORING
        { name: "Attendance Reports", href: "/admin/attendance-reports", icon: CalendarCheck, category: "Reports & Monitoring" },
        { name: "Reports", href: "/admin/reports", icon: BarChart3, category: "Reports & Monitoring" },
        { name: "System Logs", href: "/admin/logs", icon: FileText, category: "Reports & Monitoring" },
        { name: "Notifications", href: "/notifications", icon: Bell, category: "Reports & Monitoring" },
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
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {userRole === 'admin' ? (
          // Grouped admin navigation
          <>
            {/* Dashboard - standalone */}
            {navigationItems.filter(item => !item.category).map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 h-10 mb-4",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}

            {/* Setup & Configuration */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <Settings className="h-3 w-3" />
                Setup & Configuration
              </h3>
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === "Setup & Configuration").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-9 text-sm",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* User Management */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <Users className="h-3 w-3" />
                User Management
              </h3>
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === "User Management").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-9 text-sm",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Module Management */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <BookOpen className="h-3 w-3" />
                Module Management
              </h3>
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === "Module Management").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-9 text-sm",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Reports & Monitoring */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                <BarChart3 className="h-3 w-3" />
                Reports & Monitoring
              </h3>
              <div className="space-y-1">
                {navigationItems.filter(item => item.category === "Reports & Monitoring").map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-3 h-9 text-sm",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          // Regular navigation for other roles
          navigationItems.map((item) => {
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
          })
        )}
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
