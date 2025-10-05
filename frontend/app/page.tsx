"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth";
import { 
  GraduationCap, 
  Users, 
  CreditCard, 
  Building, 
  FileText,
  ArrowRight,
  Zap,
  Shield,
  Globe
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    console.log(user);
    if (user) {
      // Redirect to appropriate dashboard if already logged in
      let redirectPath = '/dashboard';
      
      switch (user.role) {
        case 'admin':
        case 'super_admin':
          redirectPath = '/admin/dashboard';
          break;
        case 'student':
          redirectPath = '/student/dashboard';
          break;
        case 'faculty':
          redirectPath = '/faculty';
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

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Comprehensive student profiles, admission tracking, and academic records"
    },
    {
      icon: CreditCard,
      title: "Fee Collection",
      description: "Automated fee processing, payment tracking, and digital receipts"
    },
    {
      icon: Building,
      title: "Hostel Management",
      description: "Room allocation, occupancy tracking, and maintenance requests"
    },
    {
      icon: FileText,
      title: "Examination System",
      description: "Exam scheduling, marks entry, and result generation"
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Streamlined Operations",
      description: "Eliminate manual processes and reduce administrative overhead"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with regular backups and monitoring"
    },
    {
      icon: Globe,
      title: "Cloud-Native",
      description: "Access from anywhere with real-time data synchronization"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">YuktiERP</h1>
            </div>
          </div>
          <Button onClick={() => router.push('/auth/login')}>
            Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            MVP Demo • College Management System
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Streamline Your
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}College Operations
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            YuktiERP unifies admissions, fee collection, hostel allocation, and examination records 
            into one lightweight, Apple-inspired platform designed for public colleges.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push('/auth/login')}>
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Replace fragmented systems with a unified solution that connects all aspects 
            of college administration.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose YuktiERP?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built specifically for the unique needs of public colleges with 
              cost-effectiveness and ease of use in mind.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Accounts Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Try the Demo</CardTitle>
              <CardDescription>
                Explore different user roles and see how YuktiERP works for each stakeholder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-green-200 bg-green-50">
                    <CardHeader className="text-center pb-2">
                      <Badge className="bg-green-100 text-green-800 mx-auto">Student</Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm font-medium">student@yukti.edu</p>
                      <p className="text-xs text-gray-600 mb-3">Password: demo123</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• View profile & grades</li>
                        <li>• Pay fees online</li>
                        <li>• Check hostel status</li>
                        <li>• Access exam results</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-blue-200 bg-blue-50">
                    <CardHeader className="text-center pb-2">
                      <Badge className="bg-blue-100 text-blue-800 mx-auto">Staff</Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm font-medium">staff@yukti.edu</p>
                      <p className="text-xs text-gray-600 mb-3">Password: demo123</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Manage admissions</li>
                        <li>• Collect fees</li>
                        <li>• Allocate hostel rooms</li>
                        <li>• Enter exam marks</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-red-200 bg-red-50">
                    <CardHeader className="text-center pb-2">
                      <Badge className="bg-red-100 text-red-800 mx-auto">Admin</Badge>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm font-medium">admin@yukti.edu</p>
                      <p className="text-xs text-gray-600 mb-3">Password: demo123</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• View analytics</li>
                        <li>• Manage users</li>
                        <li>• Generate reports</li>
                        <li>• System settings</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => router.push('/auth/login')}
                >
                  Start Demo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/95 backdrop-blur">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="font-semibold">YuktiERP</span>
              <Badge variant="outline" className="text-xs">v1.0.0 MVP</Badge>
            </div>
            <p className="text-sm text-gray-600">
              Built for the future of college management
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}