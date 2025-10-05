"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Clock, Users, BookOpen, User } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// import { Calendar } from '@/components/ui/calendar';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
}

interface Schedule {
  id: string;
  section: {
    id: string;
    name: string;
  };
  startTime: string;
  endTime: string;
  period: number;
  classType: string;
}

interface AvailableFaculty {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  department: {
    id: string;
    name: string;
    shortName: string;
  };
  designation: string;
}

interface AvailableSubstitutes {
  course: Course;
  schedules: Schedule[];
  availableFaculty: {
    sameDepartment: AvailableFaculty[];
    otherDepartments: AvailableFaculty[];
  };
}

interface SubstitutionFormData {
  courseId: string;
  date: Date | undefined;
  substituteFacultyId: string;
  reason: string;
  periods: number[];
}

// Available periods (1-8 typically)
const AVAILABLE_PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function CreateSubstitutionRequest() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableSubstitutes, setAvailableSubstitutes] = useState<AvailableSubstitutes | null>(null);
  const [formData, setFormData] = useState<SubstitutionFormData>({
    courseId: '',
    date: undefined,
    substituteFacultyId: '',
    reason: '',
    periods: [],
  });
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFacultyCourses();
  }, []);

  useEffect(() => {
    if (!formData.courseId || !formData.date) {
      setAvailableSubstitutes(null);
      setFormData(prev => ({ ...prev, periods: [] }));
    }
  }, [formData.courseId, formData.date]);

  const fetchFacultyCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      // Fetch courses assigned to the faculty
      const response = await fetch('/api/faculty-services/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCourses(data.data || []);
        if (!data.data || data.data.length === 0) {
          toast.info('No courses assigned to you');
        }
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else if (response.status === 404) {
        toast.error('Courses endpoint not found');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to fetch your courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch your courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchAvailableSubstitutes = async () => {
    if (!formData.courseId || !formData.date) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const dateStr = format(formData.date, 'yyyy-MM-dd');
      const periodsQuery = formData.periods.length > 0 ? `?periods=${formData.periods.join(',')}` : '';
      const response = await fetch(
        `/api/faculty-services/substitutions/available-substitutes/${formData.courseId}/${dateStr}${periodsQuery}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableSubstitutes(data.data);
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to fetch available substitutes');
      }
    } catch (error) {
      console.error('Error fetching available substitutes:', error);
      toast.error('Error fetching available substitutes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.courseId || !formData.date || !formData.substituteFacultyId || formData.periods.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const requestData = {
        courseId: formData.courseId,
        substituteFacultyId: formData.substituteFacultyId,
        date: format(formData.date, 'yyyy-MM-dd'),
        reason: formData.reason,
        periods: formData.periods,
      };

      const response = await fetch('/api/faculty-services/substitutions/select-substitute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Substitution request created successfully');
        
        // Reset form
        setFormData({
          courseId: '',
          date: undefined,
          substituteFacultyId: '',
          reason: '',
          periods: [],
        });
        setAvailableSubstitutes(null);
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create substitution request');
      }
    } catch (error) {
      console.error('Error creating substitution request:', error);
      toast.error('Error creating substitution request');
    } finally {
      setSubmitting(false);
    }
  };

  const FacultyCard = ({ faculty, type }: { faculty: AvailableFaculty; type: 'same' | 'other' }) => (
    <Card 
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        formData.substituteFacultyId === faculty.id && "ring-2 ring-primary"
      )}
      onClick={() => setFormData(prev => ({ ...prev, substituteFacultyId: faculty.id }))}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{faculty.user.name}</h3>
            <p className="text-sm text-muted-foreground">{faculty.designation}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {faculty.department.name}
              {type === 'same' && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Same Dept
                </span>
              )}
            </p>
          </div>
          <input
            type="radio"
            checked={formData.substituteFacultyId === faculty.id}
            onChange={() => setFormData(prev => ({ ...prev, substituteFacultyId: faculty.id }))}
            className="mt-1"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Substitution Request</h1>
        <p className="text-muted-foreground">
          Request a colleague to substitute for your classes when you're unavailable
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course">Select Course *</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}
                disabled={coursesLoading}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      coursesLoading 
                        ? "Loading courses..." 
                        : courses.length === 0 
                          ? "No courses assigned" 
                          : "Choose a course"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-courses" disabled>
                      No courses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                type="date"
                value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
                  setFormData(prev => ({ ...prev, date: selectedDate }));
                }}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Period Selection */}
        {formData.courseId && formData.date && !availableSubstitutes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Select Periods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {AVAILABLE_PERIODS.map((period) => (
                  <label
                    key={period}
                    className={cn(
                      "flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all",
                      formData.periods.includes(period)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-muted"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.periods.includes(period)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            periods: [...prev.periods, period]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            periods: prev.periods.filter(p => p !== period)
                          }));
                        }
                      }}
                      className="sr-only"
                    />
                    Period {period}
                  </label>
                ))}
              </div>
              {formData.periods.length > 0 && (
                <div className="mt-4">
                  <Button 
                    onClick={fetchAvailableSubstitutes}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Finding Available Faculty...
                      </>
                    ) : (
                      'Find Available Faculty'
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Schedule Information */}
        {availableSubstitutes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Class Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableSubstitutes.schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Section: {schedule.section.name} | Period {schedule.period} | {schedule.classType}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.periods.includes(schedule.period)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            periods: [...prev.periods, schedule.period]
                          }));
                        } else {
                          setFormData(prev => ({
                            ...prev,
                            periods: prev.periods.filter(period => period !== schedule.period)
                          }));
                        }
                      }}
                      className="h-4 w-4"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Faculty */}
        {availableSubstitutes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Available Faculty
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {availableSubstitutes.availableFaculty.sameDepartment.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 text-green-700">
                        Same Department ({availableSubstitutes.availableFaculty.sameDepartment.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSubstitutes.availableFaculty.sameDepartment.map((faculty) => (
                          <FacultyCard key={faculty.id} faculty={faculty} type="same" />
                        ))}
                      </div>
                    </div>
                  )}

                  {availableSubstitutes.availableFaculty.otherDepartments.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3 text-blue-700">
                        Other Departments ({availableSubstitutes.availableFaculty.otherDepartments.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {availableSubstitutes.availableFaculty.otherDepartments.map((faculty) => (
                          <FacultyCard key={faculty.id} faculty={faculty} type="other" />
                        ))}
                      </div>
                    </div>
                  )}

                  {availableSubstitutes.availableFaculty.sameDepartment.length === 0 && 
                   availableSubstitutes.availableFaculty.otherDepartments.length === 0 && (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <User className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground text-center">
                          No faculty available for substitution on this date and time.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reason */}
        <Card>
          <CardHeader>
            <CardTitle>Reason for Substitution</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter the reason for requesting substitution (e.g., medical appointment, personal work, conference)"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="min-h-[80px]"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              !formData.courseId || 
              !formData.date || 
              !formData.substituteFacultyId || 
              formData.periods.length === 0 ||
              submitting
            }
            className="min-w-[200px]"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              'Submit Request'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
