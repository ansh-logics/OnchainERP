"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, FileText, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Section {
  id: string;
  name: string;
  code: string;
  batch: string;
  semester: string;
  currentStrength: number;
  department: {
    id: string;
    name: string;
    code: string;
  };
}

interface CreateAssignmentFormData {
  title: string;
  description: string;
  instructions: string;
  sectionId: string;
  assignmentType: string;
  maxMarks: number;
  dueDate: string;
  submissionFormat: string;
  submissionStartDate: string;
  submissionEndDate: string;
  allowLateSubmission: boolean;
  lateSubmissionPenalty: number;
}

interface CreateAssignmentProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ASSIGNMENT_TYPES = [
  { value: 'individual', label: 'Individual Assignment' },
  { value: 'group', label: 'Group Assignment' },
  { value: 'lab', label: 'Lab Assignment' },
  { value: 'project', label: 'Project' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'presentation', label: 'Presentation' }
];

const SUBMISSION_FORMATS = [
  { value: 'pdf', label: 'PDF Document' },
  { value: 'doc', label: 'Word Document' },
  { value: 'code', label: 'Source Code' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Video' },
  { value: 'text', label: 'Text Submission' }
];

export default function CreateAssignment({ onClose, onSuccess }: CreateAssignmentProps) {
  const [sections, setSections] = useState<Section[]>([]);
  const [formData, setFormData] = useState<CreateAssignmentFormData>({
    title: '',
    description: '',
    instructions: '',
    sectionId: '',
    assignmentType: 'individual',
    maxMarks: 100,
    dueDate: '',
    submissionFormat: 'pdf',
    submissionStartDate: '',
    submissionEndDate: '',
    allowLateSubmission: false,
    lateSubmissionPenalty: 0
  });
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(true);

  useEffect(() => {
    fetchFacultySections();
  }, []);

  const fetchFacultySections = async () => {
    console.log('fetchFacultySections called');
    try {
      setSectionsLoading(true);
      const token = localStorage.getItem('token') || 'test-token';
      console.log('Using token:', token ? 'Token exists' : 'No token');
      
      // Temporarily bypass token check for testing
      // if (!token) {
      //   toast.error('No authentication token found. Please login again.');
      //   return;
      // }

      const response = await fetch('/api/faculty-services/assignments/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Sections API Response:', data);
        setSections(data.data || []);
        console.log('Sections set to:', data.data || []);
      } else if (response.status === 401) {
        console.log('Auth failed:', response.status);
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        console.log('API Error:', response.status, response.statusText);
        toast.error('Failed to fetch your sections');
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to fetch your sections');
    } finally {
      setSectionsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.sectionId || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.maxMarks <= 0) {
      toast.error('Maximum marks must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      
      const token = localStorage.getItem('token') || 'test-token';
      
      // Temporarily bypass token check for testing
      // if (!token) {
      //   toast.error('No authentication token found. Please login again.');
      //   return;
      // }

      const assignmentData = {
        ...formData,
        assignedDate: format(new Date(), 'yyyy-MM-dd')
      };

      console.log('Creating assignment with data:', assignmentData);

      const response = await fetch('/api/faculty-services/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(assignmentData),
      });

      console.log('Assignment creation response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Assignment created successfully:', data);
        toast.success(data.message || 'Assignment created successfully');
        onSuccess();
        onClose();
      } else if (response.status === 401) {
        console.log('Auth failed for assignment creation');
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        const error = await response.json();
        console.log('Assignment creation error:', error);
        toast.error(error.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Error creating assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmissionFormatChange = (format: string) => {
    setFormData(prev => ({
      ...prev,
      submissionFormat: format
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Create New Assignment
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Assignment Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="section">Section *</Label>
                  <Select
                    value={formData.sectionId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, sectionId: value }))}
                    disabled={sectionsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue 
                        placeholder={
                          sectionsLoading 
                            ? "Loading sections..." 
                            : sections.length === 0 
                              ? "No sections assigned" 
                              : "Select a section"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.length > 0 ? (
                        sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name} ({section.code}) - {section.department.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-sections" disabled>
                          No sections available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="assignmentType">Assignment Type *</Label>
                  <Select
                    value={formData.assignmentType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, assignmentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASSIGNMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxMarks">Maximum Marks *</Label>
                  <Input
                    id="maxMarks"
                    type="number"
                    min="1"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a clear description of the assignment"
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                  placeholder="Detailed instructions for students (optional)"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Submission Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="submissionFormat">Primary Submission Format *</Label>
                <Select
                  value={formData.submissionFormat}
                  onValueChange={handleSubmissionFormatChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select submission format" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBMISSION_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
