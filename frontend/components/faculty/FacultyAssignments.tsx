"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Calendar, 
  Clock, 
  Users, 
  Search, 
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { format, isAfter, isBefore } from 'date-fns';
import { toast } from 'sonner';
import CreateAssignment from './CreateAssignment';
import ViewSubmissions from './ViewSubmissions';

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions?: string;
  section: {
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
  };
  faculty: {
    id: string;
    user: {
      name: string;
    };
  };
  assignmentType: string;
  submissionFormat: string;
  maxMarks: number;
  assignedDate: string;
  dueDate: string;
  submissionStartDate?: string;
  submissionEndDate?: string;
  allowLateSubmission: boolean;
  lateSubmissionPenalty?: number;
  status: string;
  isActive: boolean;
  statistics: {
    totalSubmissions: number;
    gradedSubmissions: number;
    pendingGrading: number;
    submissionRate: number;
  };
  submissions: Array<{
    id: string;
    studentId: string;
    submissionDate: string;
    status: string;
    marksObtained: number | null;
  }>;
}

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

export default function FacultyAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchAssignments();
    fetchSections();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      // First fetch sections, then fetch assignments for each section
      const sectionsResponse = await fetch('/api/faculty-services/assignments/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (sectionsResponse.ok) {
        const sectionsData = await sectionsResponse.json();
        const sections = sectionsData.data || [];
        
        // Fetch assignments for all sections
        const allAssignments = [];
        for (const section of sections) {
          try {
            const assignmentsResponse = await fetch(`/api/faculty-services/assignments/section/${section.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            if (assignmentsResponse.ok) {
              const assignmentsData = await assignmentsResponse.json();
              allAssignments.push(...(assignmentsData.data || []));
            }
          } catch (error) {
            console.error(`Error fetching assignments for section ${section.id}:`, error);
          }
        }
        
        setAssignments(allAssignments);
      } else if (sectionsResponse.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        toast.error('Failed to fetch assignments');
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/faculty-services/assignments/sections', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSections(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch(`/api/faculty-services/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Assignment deleted successfully');
        fetchAssignments();
      } else if (response.status === 401) {
        toast.error('Authentication failed. Please login again.');
        localStorage.removeItem('token');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete assignment');
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Error deleting assignment');
    }
  };

  const getStatusColor = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (isBefore(dueDate, now)) {
      return 'destructive';
    } else if (isBefore(dueDate, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))) {
      return 'warning';
    } else {
      return 'default';
    }
  };

  const getStatusText = (assignment: Assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (isBefore(dueDate, now)) {
      return 'Overdue';
    } else if (isBefore(dueDate, new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000))) {
      return 'Due Soon';
    } else {
      return 'Active';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.section.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.section.department.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSection = selectedSection === 'all' || selectedSection === '' || assignment.section.id === selectedSection;
    const matchesType = selectedType === 'all' || selectedType === '' || assignment.assignmentType === selectedType;
    
    let matchesStatus = true;
    if (selectedStatus !== 'all' && selectedStatus !== '') {
      const status = getStatusText(assignment);
      matchesStatus = status.toLowerCase() === selectedStatus.toLowerCase();
    }

    return matchesSearch && matchesSection && matchesType && matchesStatus;
  });

  const AssignmentCard = ({ assignment }: { assignment: Assignment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1">
              {assignment.title}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {assignment.section.code} - {assignment.section.name}
              </span>
              <span className="text-xs">
                {assignment.section.department.name} | Batch: {assignment.section.batch}
              </span>
              <Badge variant="outline">
                {assignment.assignmentType}
              </Badge>
            </div>
          </div>
          <Badge variant={getStatusColor(assignment) as any}>
            {getStatusText(assignment)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {assignment.description}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due: {format(new Date(assignment.dueDate), 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {assignment.statistics.totalSubmissions}/{assignment.section.currentStrength} submitted ({assignment.statistics.submissionRate}%)
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                {assignment.statistics.gradedSubmissions} graded
              </span>
              <span>Max: {assignment.maxMarks} marks</span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSubmissions(assignment.id)}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              View Submissions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Implement edit */}}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteAssignment(assignment.id)}
              className="flex items-center gap-1 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground">
            Manage assignments for your courses
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="All Sections" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sections</SelectItem>
                {sections.map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.code} - {section.name} ({section.department.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="lab">Lab</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="presentation">Presentation</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="due soon">Due Soon</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Assignments ({filteredAssignments.length})</TabsTrigger>
          <TabsTrigger value="active">
            Active ({filteredAssignments.filter(a => getStatusText(a) === 'Active').length})
          </TabsTrigger>
          <TabsTrigger value="due-soon">
            Due Soon ({filteredAssignments.filter(a => getStatusText(a) === 'Due Soon').length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({filteredAssignments.filter(a => getStatusText(a) === 'Overdue').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredAssignments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No assignments found. Create your first assignment to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments
              .filter(a => getStatusText(a) === 'Active')
              .map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="due-soon" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments
              .filter(a => getStatusText(a) === 'Due Soon')
              .map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments
              .filter(a => getStatusText(a) === 'Overdue')
              .map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showCreateForm && (
        <CreateAssignment
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            fetchAssignments();
            setShowCreateForm(false);
          }}
        />
      )}

      {showSubmissions && (
        <ViewSubmissions
          assignmentId={showSubmissions}
          onClose={() => setShowSubmissions(null)}
        />
      )}
    </div>
  );
}
