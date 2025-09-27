"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, LogOut } from "lucide-react";
import { getCurrentUser, logout, UserRole } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
}

const getRoleColor = (role: UserRole) => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'staff': return 'bg-blue-100 text-blue-800';
    case 'student': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<{name: string; role: string; email: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>
          
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <Badge variant="secondary" className={getRoleColor(user.role as UserRole)}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
