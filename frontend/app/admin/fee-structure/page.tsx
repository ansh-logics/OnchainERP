"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCurrentUser } from "@/lib/auth";
import { 
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Save,
  BookOpen,
  GraduationCap,
  Calendar,
  CreditCard,
  FileText,
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface FeeStructure {
  id: string;
  program: string;
  year: string;
  semester: string;
  tuitionFee: number;
  labFee: number;
  libraryFee: number;
  examFee: number;
  developmentFee: number;
  hostelFee?: number;
  transportFee?: number;
  otherFees: number;
  totalFee: number;
  dueDate: string;
  lateFeePenalty: number;
  status: 'active' | 'draft' | 'archived';
}

export default function FeeStructurePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState("all");
  const [selectedYear, setSelectedYear] = useState("2024-25");
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      router.push('/auth/login');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const feeStructures: FeeStructure[] = [
    {
      id: "1",
      program: "B.Tech Computer Science",
      year: "First Year",
      semester: "Odd Semester",
      tuitionFee: 75000,
      labFee: 15000,
      libraryFee: 3000,
      examFee: 2000,
      developmentFee: 10000,
      hostelFee: 25000,
      transportFee: 8000,
      otherFees: 2000,
      totalFee: 140000,
      dueDate: "2024-07-31",
      lateFeePenalty: 500,
      status: "active"
    },
    {
      id: "2",
      program: "B.Tech Computer Science",
      year: "Second Year",
      semester: "Odd Semester",
      tuitionFee: 80000,
      labFee: 18000,
      libraryFee: 3000,
      examFee: 2000,
      developmentFee: 10000,
      hostelFee: 25000,
      transportFee: 8000,
      otherFees: 2000,
      totalFee: 148000,
      dueDate: "2024-07-31",
      lateFeePenalty: 500,
      status: "active"
    },
    {
      id: "3",
      program: "M.Tech Computer Science",
      year: "First Year",
      semester: "Odd Semester",
      tuitionFee: 95000,
      labFee: 20000,
      libraryFee: 4000,
      examFee: 3000,
      developmentFee: 15000,
      hostelFee: 30000,
      otherFees: 3000,
      totalFee: 170000,
      dueDate: "2024-07-31",
      lateFeePenalty: 750,
      status: "active"
    },
    {
      id: "4",
      program: "MBA",
      year: "First Year",
      semester: "Odd Semester",
      tuitionFee: 120000,
      labFee: 10000,
      libraryFee: 5000,
      examFee: 3000,
      developmentFee: 20000,
      hostelFee: 35000,
      otherFees: 7000,
      totalFee: 200000,
      dueDate: "2024-07-31",
      lateFeePenalty: 1000,
      status: "active"
    }
  ];

  const programs = ["All Programs", "B.Tech Computer Science", "B.Tech Electronics", "B.Tech Mechanical", "M.Tech Computer Science", "MBA"];

  const filteredFees = feeStructures.filter(fee => 
    selectedProgram === "all" || selectedProgram === "All Programs" || fee.program === selectedProgram
  );

  const calculateFeeBreakdown = (fees: FeeStructure[]) => {
    const total = fees.reduce((sum, fee) => sum + fee.totalFee, 0);
    return {
      tuition: fees.reduce((sum, fee) => sum + fee.tuitionFee, 0),
      lab: fees.reduce((sum, fee) => sum + fee.labFee, 0),
      library: fees.reduce((sum, fee) => sum + fee.libraryFee, 0),
      exam: fees.reduce((sum, fee) => sum + fee.examFee, 0),
      development: fees.reduce((sum, fee) => sum + fee.developmentFee, 0),
      hostel: fees.reduce((sum, fee) => sum + (fee.hostelFee || 0), 0),
      transport: fees.reduce((sum, fee) => sum + (fee.transportFee || 0), 0),
      others: fees.reduce((sum, fee) => sum + fee.otherFees, 0),
      total
    };
  };

  const feeBreakdown = calculateFeeBreakdown(filteredFees);

  return (
    <DashboardLayout title="Fee Structure" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Fee Structure Management</h2>
            <p className="text-muted-foreground">Manage academic fee structures and payment schedules</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Academic Year</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023-24">2023-24</SelectItem>
                    <SelectItem value="2024-25">2024-25</SelectItem>
                    <SelectItem value="2025-26">2025-26</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Program</Label>
                <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program} value={program === "All Programs" ? "all" : program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Semester</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="odd">Odd Semester</SelectItem>
                    <SelectItem value="even">Even Semester</SelectItem>
                    <SelectItem value="summer">Summer Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="structures" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structures">Fee Structures</TabsTrigger>
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="structures" className="space-y-6">
            <div className="space-y-6">
              {filteredFees.map((fee) => (
                <Card key={fee.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{fee.program}</CardTitle>
                        <CardDescription>{fee.year} - {fee.semester}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          fee.status === 'active' ? 'bg-green-100 text-green-800' :
                          fee.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {fee.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">Tuition Fee</p>
                        <p className="text-lg font-bold text-blue-600">₹{fee.tuitionFee.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">Lab Fee</p>
                        <p className="text-lg font-bold text-green-600">₹{fee.labFee.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">Library Fee</p>
                        <p className="text-lg font-bold text-purple-600">₹{fee.libraryFee.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-sm text-gray-600">Exam Fee</p>
                        <p className="text-lg font-bold text-orange-600">₹{fee.examFee.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <p className="text-sm text-gray-600">Development Fee</p>
                        <p className="text-lg font-bold text-indigo-600">₹{fee.developmentFee.toLocaleString()}</p>
                      </div>
                      {fee.hostelFee && (
                        <div className="text-center p-3 bg-pink-50 rounded-lg">
                          <p className="text-sm text-gray-600">Hostel Fee</p>
                          <p className="text-lg font-bold text-pink-600">₹{fee.hostelFee.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Semester Fee</p>
                          <p className="text-2xl font-bold text-gray-900">₹{fee.totalFee.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Due Date</p>
                          <p className="font-medium">{new Date(fee.dueDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Late Fee Penalty</p>
                          <p className="font-medium text-red-600">₹{fee.lateFeePenalty} per day</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Activate
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Collection</p>
                      <p className="text-2xl font-bold">₹{(feeBreakdown.total / 100000).toFixed(1)}L</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tuition Fees</p>
                      <p className="text-2xl font-bold">₹{(feeBreakdown.tuition / 100000).toFixed(1)}L</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Lab & Development</p>
                      <p className="text-2xl font-bold">₹{((feeBreakdown.lab + feeBreakdown.development) / 100000).toFixed(1)}L</p>
                    </div>
                    <GraduationCap className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Hostel Fees</p>
                      <p className="text-2xl font-bold">₹{(feeBreakdown.hostel / 100000).toFixed(1)}L</p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fee Breakdown by Category</CardTitle>
                <CardDescription>Detailed analysis of fee components</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: "Tuition Fee", amount: feeBreakdown.tuition, color: "bg-blue-500" },
                    { label: "Lab Fee", amount: feeBreakdown.lab, color: "bg-green-500" },
                    { label: "Development Fee", amount: feeBreakdown.development, color: "bg-purple-500" },
                    { label: "Hostel Fee", amount: feeBreakdown.hostel, color: "bg-orange-500" },
                    { label: "Library Fee", amount: feeBreakdown.library, color: "bg-indigo-500" },
                    { label: "Exam Fee", amount: feeBreakdown.exam, color: "bg-pink-500" },
                    { label: "Transport Fee", amount: feeBreakdown.transport, color: "bg-yellow-500" },
                    { label: "Other Fees", amount: feeBreakdown.others, color: "bg-gray-500" }
                  ].map((item) => {
                    const percentage = feeBreakdown.total > 0 ? (item.amount / feeBreakdown.total) * 100 : 0;
                    return (
                      <div key={item.label} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{item.label}</span>
                          <span className="text-sm text-gray-600">₹{item.amount.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fee Structure Templates</CardTitle>
                <CardDescription>Pre-configured templates for different programs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold mb-2">Engineering Programs</h3>
                      <p className="text-sm text-gray-600 mb-4">Standard fee structure for B.Tech programs</p>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold mb-2">Management Programs</h3>
                      <p className="text-sm text-gray-600 mb-4">Fee structure for MBA and management courses</p>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="font-semibold mb-2">Postgraduate Programs</h3>
                      <p className="text-sm text-gray-600 mb-4">M.Tech and postgraduate fee structure</p>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import/Export Options</CardTitle>
                <CardDescription>Manage fee structure data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Import Fee Structures</h3>
                    <p className="text-sm text-gray-600">Import fee data from CSV or Excel files</p>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Import from File
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Export Fee Structures</h3>
                    <p className="text-sm text-gray-600">Export current fee structures to various formats</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">PDF</Button>
                      <Button variant="outline" size="sm">Excel</Button>
                      <Button variant="outline" size="sm">CSV</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Fee Structure Analytics
                </CardTitle>
                <CardDescription>Revenue projections and fee analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Program-wise Fee Comparison</h3>
                    <div className="space-y-3">
                      {feeStructures.map((fee) => (
                        <div key={fee.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{fee.program}</p>
                            <p className="text-xs text-gray-600">{fee.year}</p>
                          </div>
                          <p className="font-bold text-lg">₹{(fee.totalFee / 1000).toFixed(0)}K</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Revenue Projections</h3>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <p className="font-medium">Projected Annual Revenue</p>
                        </div>
                        <p className="text-2xl font-bold text-green-600">₹{((feeBreakdown.total * 2) / 10000000).toFixed(1)} Crores</p>
                        <p className="text-sm text-gray-600">Based on current enrollment</p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <p className="font-medium mb-2">Fee Collection Efficiency</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>On-time payments</span>
                            <span className="font-medium">85%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Late payments</span>
                            <span className="font-medium">12%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Pending</span>
                            <span className="font-medium text-red-600">3%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
