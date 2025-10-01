"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, CheckCircle, AlertCircle, Building, MapPin, Phone, FileText, UserCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Stepper, { Step } from "@/components/ui/stepper";

interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

function Alert({ type, message, onClose }: AlertProps) {
  return (
    <div className={`flex items-center p-4 mb-4 rounded-lg ${
      type === 'success' 
        ? 'bg-green-50 text-green-800 border border-green-200' 
        : 'bg-red-50 text-red-800 border border-red-200'
    }`}>
      {type === 'success' ? (
        <CheckCircle className="w-5 h-5 mr-2" />
      ) : (
        <AlertCircle className="w-5 h-5 mr-2" />
      )}
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-sm underline hover:no-underline"
      >
        Close
      </button>
    </div>
  );
}

interface StepIndicatorCustomProps {
  step: number;
  currentStep: number;
  isValid: boolean;
  onClick: () => void;
}

function ValidationMessage({ isValid, message, show }: { isValid: boolean; message: string; show: boolean }) {
  if (!show) return null;
  
  return (
    <div className={`flex items-center mt-1 text-xs ${isValid ? 'text-emerald-600' : 'text-red-500'}`}>
      {isValid ? (
        <CheckCircle className="w-3 h-3 mr-1" />
      ) : (
        <AlertCircle className="w-3 h-3 mr-1" />
      )}
      <span>{message}</span>
    </div>
  );
}

function StepIndicatorCustom({ step, currentStep, isValid, onClick }: StepIndicatorCustomProps) {
  const isActive = step === currentStep;
  const isCompleted = step < currentStep && isValid;
  const isClickable = step < currentStep || (step === currentStep && isValid);

  return (
    <div 
      className={`flex items-center ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
      onClick={isClickable ? onClick : undefined}
    >
      <div className={`
        flex h-8 w-8 items-center justify-center rounded-full font-medium text-xs transition-all duration-200
        ${isCompleted 
          ? 'bg-slate-900 text-white' 
          : isActive
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-400'
        }
      `}>
        {isCompleted ? (
          <CheckCircle className="w-4 h-4" />
        ) : (
          <span>{step}</span>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Basic College Information
    name: "",
    shortName: "",
    establishedYear: "",
    affiliatedUniversity: "",
    collegeType: "",
    
    // Address
    addressStreet: "",
    addressCity: "",
    addressState: "",
    addressPincode: "",
    addressCountry: "India",
    
    // Contact Details
    phone: "",
    email: "",
    website: "",
    fax: "",
    
    // Registration Details
    registrationNumber: "",
    
    // Admin Details
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminPhone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Auto-format phone number
    if (name === 'phone' || name === 'adminPhone') {
      formattedValue = formatPhoneNumber(value);
    }

    // Auto-format website URL
    if (name === 'website' && value && !value.startsWith('http')) {
      formattedValue = `https://${value.replace(/^https?:\/\//, '')}`;
    }

    // Format pincode (only allow 6 digits)
    if (name === 'addressPincode') {
      formattedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    // Format established year (only allow 4 digits)
    if (name === 'establishedYear') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{5})(\d{5})/, '$1 $2');
    }
    return numbers.slice(0, 10).replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneNumbers = phone.replace(/\D/g, '');
    return phoneNumbers.length === 10;
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // College Information
        return !!(formData.name && formData.shortName && formData.establishedYear && formData.collegeType);
      case 2: // Address
        return !!(formData.addressStreet && formData.addressCity && formData.addressState && formData.addressPincode);
      case 3: // Contact Details
        return !!(formData.phone && formData.email);
      case 4: // Registration Details
        return !!formData.registrationNumber;
      case 5: // Admin Details
        return !!(formData.adminName && formData.adminEmail && formData.adminPassword && formData.adminPhone);
      default:
        return false;
    }
  };

  const registerCollege = async () => {
    setLoading(true);
    setAlert(null);

    // Prepare the data for submission
    const submissionData = {
      ...formData,
      // Format phone numbers to remove spaces for backend
      phone: formData.phone.replace(/\s/g, ''),
      adminPhone: formData.adminPhone.replace(/\s/g, ''),
    };

    console.log('Submitting college registration data:', submissionData);

    try {
      const response = await fetch('/api/colleges/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        setAlert({ 
          type: 'success', 
          message: 'Welcome to Yukti ERP! Your college has been registered successfully.' 
        });
        setTimeout(() => router.push('/auth/login'), 2000);
      } else {
        setAlert({ 
          type: 'error', 
          message: data.message || 'Registration failed. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlert({ 
        type: 'error', 
        message: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setLoading(false);
    }
  };
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
              Welcome to the future of
              <br />
              <span className="text-blue-400">college management</span>
            </h2>
            
            <p className="text-slate-300 text-lg leading-relaxed max-w-md">
              Join thousands of educational institutions worldwide who trust YuktiERP 
              for comprehensive academic administration.
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

      {/* Right Side - Registration Form */}
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
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Get started</h2>
                  <p className="text-slate-600 text-sm">Create your college account to begin</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 mb-1">Already registered?</p>
                  <Link href="/auth/login">
                    <button className="text-slate-900 font-medium text-sm hover:text-slate-700 transition-colors underline underline-offset-2 hover:underline-offset-1">
                      Sign in
                    </button>
                  </Link>
                </div>
              </div>
            </div>
            
            {alert && (
              <div className={`p-3 rounded-xl mb-4 ${
                alert.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{alert.message}</p>
                  <button
                    onClick={() => setAlert(null)}
                    className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <Stepper
            onFinalStepCompleted={registerCollege}
            onStepChange={setCurrentStep}
            disableStepIndicators={true}
            nextButtonProps={{
              disabled: !validateStep(currentStep)
            }}
            renderStepIndicator={({ step, currentStep, onStepClick }) => (
              <StepIndicatorCustom 
                step={step}
                currentStep={currentStep}
                isValid={validateStep(step)}
                onClick={() => {
                  // Only allow clicking on completed steps
                  if (step < currentStep || (step === currentStep && validateStep(step))) {
                    onStepClick(step);
                  }
                }}
              />
            )}
          >
            {/* Step 1: College Information */}
            <Step>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Building className="h-3 w-3 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">College Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">College Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      placeholder="Enter your college name" 
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Short Name</label>
                      <input 
                        type="text" 
                        name="shortName" 
                        placeholder="ABC College" 
                        value={formData.shortName}
                        onChange={handleInputChange}
                        maxLength={10}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                      />
                      <ValidationMessage 
                        isValid={formData.shortName.length >= 2}
                        message={formData.shortName.length >= 2 ? "Looks good!" : "At least 2 characters required"}
                        show={formData.shortName.length > 0}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Established Year</label>
                      <input 
                        type="text" 
                        name="establishedYear" 
                        placeholder="1990" 
                        value={formData.establishedYear}
                        onChange={handleInputChange}
                        maxLength={4}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                      />
                      <ValidationMessage 
                        isValid={formData.establishedYear.length === 4 && parseInt(formData.establishedYear) >= 1800}
                        message={formData.establishedYear.length === 4 ? "Valid year" : "Enter a valid 4-digit year"}
                        show={formData.establishedYear.length > 0}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Affiliated University</label>
                    <input 
                      type="text" 
                      name="affiliatedUniversity" 
                      placeholder="University name (optional)" 
                      value={formData.affiliatedUniversity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">College Type</label>
                    <select 
                      name="collegeType" 
                      value={formData.collegeType}
                      onChange={(e) => handleInputChange(e as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white appearance-none text-sm"
                    >
                      <option value="">Select type</option>
                      <option value="Government">Government</option>
                      <option value="Private">Private</option>
                      <option value="Autonomous">Autonomous</option>
                      <option value="Deemed">Deemed University</option>
                    </select>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 2: Address */}
            <Step>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Address Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Street Address</label>
                    <input 
                      type="text" 
                      name="addressStreet" 
                      placeholder="Enter street address" 
                      value={formData.addressStreet}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                      <input 
                        type="text" 
                        name="addressCity" 
                        placeholder="City name" 
                        value={formData.addressCity}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">State</label>
                      <input 
                        type="text" 
                        name="addressState" 
                        placeholder="State name" 
                        value={formData.addressState}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Pincode</label>
                      <input 
                        type="text" 
                        name="addressPincode" 
                        placeholder="123456" 
                        value={formData.addressPincode}
                        onChange={handleInputChange}
                        maxLength={6}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                      />
                      <ValidationMessage 
                        isValid={formData.addressPincode.length === 6}
                        message={formData.addressPincode.length === 6 ? "Valid pincode" : "Must be exactly 6 digits"}
                        show={formData.addressPincode.length > 0}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Country</label>
                      <input 
                        type="text" 
                        name="addressCountry" 
                        value="India"
                        readOnly
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed text-sm" 
                      />
                      <p className="text-xs text-slate-500 mt-1">Currently only available in India</p>
                    </div>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 3: Contact Details */}
            <Step>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-3 w-3 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Contact Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-slate-500">+91</span>
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder="98765 43210" 
                          value={formData.phone}
                          onChange={handleInputChange}
                          maxLength={11}
                          className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                        />
                      </div>
                      <ValidationMessage 
                        isValid={validatePhone(formData.phone)}
                        message={validatePhone(formData.phone) ? "Valid phone number" : "Enter a valid 10-digit number"}
                        show={formData.phone.length > 0}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        name="email" 
                        placeholder="info@college.edu" 
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                      />
                      <ValidationMessage 
                        isValid={validateEmail(formData.email)}
                        message={validateEmail(formData.email) ? "Valid email address" : "Enter a valid email address"}
                        show={formData.email.length > 0}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Website (Optional)</label>
                    <input 
                      type="url" 
                      name="website" 
                      placeholder="www.college.edu" 
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                    />
                    {formData.website && (
                      <p className="text-xs text-slate-500 mt-1">Will be formatted as: {formData.website}</p>
                    )}
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 4: Registration Details */}
            <Step>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-3 w-3 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Registration Details</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Registration Number</label>
                    <input 
                      type="text" 
                      name="registrationNumber" 
                      placeholder="Enter official registration number" 
                      value={formData.registrationNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Official registration number issued by the education department
                    </p>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 5: Admin Details */}
            <Step>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="h-3 w-3 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">Administrator Account</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Admin Full Name</label>
                    <input 
                      type="text" 
                      name="adminName" 
                      placeholder="Enter administrator name" 
                      value={formData.adminName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Admin Email</label>
                      <input 
                        type="email" 
                        name="adminEmail" 
                        placeholder="admin@college.edu" 
                        value={formData.adminEmail}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                      />
                      <ValidationMessage 
                        isValid={validateEmail(formData.adminEmail)}
                        message={validateEmail(formData.adminEmail) ? "Valid email address" : "Enter a valid email address"}
                        show={formData.adminEmail.length > 0}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Admin Phone</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-sm text-slate-500">+91</span>
                        <input 
                          type="tel" 
                          name="adminPhone" 
                          placeholder="98765 43210" 
                          value={formData.adminPhone}
                          onChange={handleInputChange}
                          maxLength={11}
                          className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                        />
                      </div>
                      <ValidationMessage 
                        isValid={validatePhone(formData.adminPhone)}
                        message={validatePhone(formData.adminPhone) ? "Valid phone number" : "Enter a valid 10-digit number"}
                        show={formData.adminPhone.length > 0}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Admin Password</label>
                    <input 
                      type="password" 
                      name="adminPassword" 
                      placeholder="Create a secure password" 
                      value={formData.adminPassword}
                      onChange={handleInputChange}
                      minLength={6}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-slate-50 focus:bg-white text-sm" 
                    />
                    <ValidationMessage 
                      isValid={formData.adminPassword.length >= 6}
                      message={formData.adminPassword.length >= 6 ? "Password strength: Good" : "Minimum 6 characters required"}
                      show={formData.adminPassword.length > 0}
                    />
                  </div>
                  
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-700">
                      <strong>Important:</strong> This account will have full administrative privileges. 
                      Make sure to use a secure password and valid email address.
                    </p>
                  </div>
                </div>
                
                {loading && (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-900"></div>
                    <span className="ml-3 text-slate-600 font-medium">Creating your college account...</span>
                  </div>
                )}
              </div>
            </Step>
            </Stepper>
          </div>
        </div>
      </div>
    </div>
  );
}
