"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, X } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    password: ""
  });
  const router = useRouter();

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Real-time validation
    let error = "";
    switch (field) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
    }
    
    setValidationErrors(prev => ({ ...prev, [field]: error }));
    
    // Clear global errors when user starts typing
    if (error || success) {
      setError("");
      setSuccess("");
    }
  };

  const validateForm = () => {
    const errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password)
    };
    
    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Please fix the errors above");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess("Login successful! Redirecting...");
        
        // Store authentication data
        if (result.token) {
          localStorage.setItem('authToken', result.token);
        }
        if (result.data) {
          localStorage.setItem('user', JSON.stringify(result.data));
        }
        
        setTimeout(() => {
          // Redirect based on user role from backend response
          const userRole = result.data?.role;
          let redirectPath = '/dashboard'; // default fallback
          
          switch (userRole) {
            case 'admin':
            case 'super_admin':
              redirectPath = '/admin/dashboard';
              break;
            case 'student':
              redirectPath = '/student/dashboard';
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
          
          console.log(`Redirecting ${userRole} to ${redirectPath}`);
          router.push(redirectPath);
        }, 1500);
      } else {
        setError(result.message || result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = !Object.values(validationErrors).some(error => error !== "") && 
                     formData.email.trim() && formData.password.trim();

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative">
        <div className="flex flex-col justify-center items-start text-white p-16 w-full">
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <GraduationCap className="h-5 w-5 text-slate-900" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">YuktiERP</h1>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-4">
              Welcome Back
            </h2>
            
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Access your educational dashboard to manage courses, track progress, and stay connected with your academic journey.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium mb-1">Complete Student Lifecycle</p>
                <p className="text-sm text-slate-400">From admission to graduation, manage every aspect</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium mb-1">Advanced Analytics</p>
                <p className="text-sm text-slate-400">Data-driven insights for better decisions</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-3 flex-shrink-0"></div>
              <div>
                <p className="font-medium mb-1">Secure & Scalable</p>
                <p className="text-sm text-slate-400">Enterprise-grade security and performance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-3/5 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-slate-900 text-white p-6">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 bg-white rounded flex items-center justify-center mr-2">
              <GraduationCap className="h-4 w-4 text-slate-900" />
            </div>
            <h1 className="text-lg font-semibold">YuktiERP</h1>
          </div>
          <p className="text-slate-300 text-sm">College Management System</p>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
          <div className="w-full max-w-lg">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Sign In</h2>
                  <p className="text-slate-600 text-sm">Welcome back! Please sign in to continue.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Don't have an account?</p>
                  <Link href="/auth/register">
                    <button className="text-slate-900 font-medium text-sm hover:text-slate-700 transition-colors underline underline-offset-2 hover:underline-offset-1">
                      Register College
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            {/* Success Message */}
            {success && (
              <div className={`p-3 rounded-xl mb-4 bg-emerald-50 text-emerald-800 border border-emerald-200`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{success}</p>
                  <button
                    onClick={() => setSuccess("")}
                    className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className={`p-3 rounded-xl mb-4 bg-red-50 text-red-800 border border-red-200`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{error}</p>
                  <button
                    onClick={() => setError("")}
                    className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm"
                    placeholder="Enter your email address"
                  />
                  {validationErrors.email && (
                    <div className={`flex items-center mt-1 text-xs text-red-500`}>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      <span>{validationErrors.email}</span>
                    </div>
                  )}
                  {formData.email && !validationErrors.email && (
                    <div className={`flex items-center mt-1 text-xs text-emerald-600`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>Valid email address</span>
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <div className={`flex items-center mt-1 text-xs text-red-500`}>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      <span>{validationErrors.password}</span>
                    </div>
                  )}
                  {formData.password && !validationErrors.password && (
                    <div className={`flex items-center mt-1 text-xs text-emerald-600`}>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span>Password strength: Good</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                  !isFormValid || isLoading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            {/* Demo Accounts - Match registration page style */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-600 text-center mb-3">Demo Accounts (Password: demo123)</p>
              <div className="space-y-2">
                <div 
                  className="flex items-center justify-between text-xs cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => {
                    setFormData({ email: "student@yukti.edu", password: "demo123" });
                    setValidationErrors({ email: "", password: "" });
                  }}
                >
                  <span className="text-slate-700">student@yukti.edu</span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Student</span>
                </div>
                <div 
                  className="flex items-center justify-between text-xs cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => {
                    setFormData({ email: "admin@yukti.edu", password: "demo123" });
                    setValidationErrors({ email: "", password: "" });
                  }}
                >
                  <span className="text-slate-700">admin@yukti.edu</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-medium">Admin</span>
                </div>
                <div 
                  className="flex items-center justify-between text-xs cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => {
                    setFormData({ email: "staff@yukti.edu", password: "demo123" });
                    setValidationErrors({ email: "", password: "" });
                  }}
                >
                  <span className="text-slate-700">staff@yukti.edu</span>
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">Staff</span>
                </div>
              </div>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-900"></div>
                <span className="ml-3 text-slate-600 font-medium">Signing you in...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
