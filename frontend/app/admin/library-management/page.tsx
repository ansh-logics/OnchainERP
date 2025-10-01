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
  BookOpen,
  Search,
  Filter,
  Eye,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Book,
  Users,
  Calendar,
  User,
  Plus,
  Edit,
  Trash2,
  RotateCcw,
  Bookmark,
  Archive,
  Scan,
  FileText,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  BarChart3,
  Library
} from "lucide-react";

interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  edition: string;
  publishYear: number;
  totalCopies: number;
  availableCopies: number;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock' | 'damaged';
  rating: number;
  popularity: number;
}

interface BookTransaction {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  course: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue' | 'lost' | 'renewed';
  renewalCount: number;
  fineAmount: number;
}

export default function LibraryManagementPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTransactionStatus, setSelectedTransactionStatus] = useState("all");
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

  const books: LibraryBook[] = [
    {
      id: "1",
      isbn: "9780134685991",
      title: "Database System Concepts",
      author: "Abraham Silberschatz",
      publisher: "McGraw-Hill",
      category: "Computer Science",
      edition: "7th Edition",
      publishYear: 2020,
      totalCopies: 15,
      availableCopies: 8,
      location: "CS Section - Shelf A3",
      status: "available",
      rating: 4.5,
      popularity: 85
    },
    {
      id: "2",
      isbn: "9780321573513",
      title: "Algorithms",
      author: "Robert Sedgewick",
      publisher: "Addison-Wesley",
      category: "Computer Science",
      edition: "4th Edition",
      publishYear: 2011,
      totalCopies: 12,
      availableCopies: 2,
      location: "CS Section - Shelf B1",
      status: "low_stock",
      rating: 4.7,
      popularity: 92
    },
    {
      id: "3",
      isbn: "9780133943030",
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum",
      publisher: "Pearson",
      category: "Computer Science",
      edition: "5th Edition",
      publishYear: 2011,
      totalCopies: 10,
      availableCopies: 0,
      location: "CS Section - Shelf A5",
      status: "out_of_stock",
      rating: 4.3,
      popularity: 78
    },
    {
      id: "4",
      isbn: "9780073523323",
      title: "Financial Management",
      author: "Eugene F. Brigham",
      publisher: "Cengage Learning",
      category: "Management",
      edition: "15th Edition",
      publishYear: 2019,
      totalCopies: 8,
      availableCopies: 5,
      location: "Management Section - Shelf M2",
      status: "available",
      rating: 4.1,
      popularity: 65
    },
    {
      id: "5",
      isbn: "9781118431221",
      title: "Digital Signal Processing",
      author: "John G. Proakis",
      publisher: "Pearson",
      category: "Electronics",
      edition: "4th Edition",
      publishYear: 2013,
      totalCopies: 6,
      availableCopies: 4,
      location: "ECE Section - Shelf E1",
      status: "available",
      rating: 4.4,
      popularity: 71
    }
  ];

  const transactions: BookTransaction[] = [
    {
      id: "1",
      bookId: "1",
      bookTitle: "Database System Concepts",
      studentId: "YU2024001",
      studentName: "Arjun Sharma",
      rollNumber: "21CS001",
      course: "B.Tech CSE",
      issueDate: "2024-07-01",
      dueDate: "2024-07-15",
      returnDate: "2024-07-14",
      status: "returned",
      renewalCount: 0,
      fineAmount: 0
    },
    {
      id: "2",
      bookId: "2",
      bookTitle: "Algorithms",
      studentId: "YU2024002",
      studentName: "Priya Patel",
      rollNumber: "21EC002",
      course: "B.Tech ECE",
      issueDate: "2024-07-05",
      dueDate: "2024-07-19",
      status: "issued",
      renewalCount: 1,
      fineAmount: 0
    },
    {
      id: "3",
      bookId: "3",
      bookTitle: "Computer Networks",
      studentId: "YU2024003",
      studentName: "Rahul Singh",
      rollNumber: "22MBA001",
      course: "MBA",
      issueDate: "2024-06-20",
      dueDate: "2024-07-04",
      status: "overdue",
      renewalCount: 0,
      fineAmount: 50
    },
    {
      id: "4",
      bookId: "4",
      bookTitle: "Financial Management",
      studentId: "YU2024004",
      studentName: "Sneha Gupta",
      rollNumber: "21CS003",
      course: "B.Tech CSE",
      issueDate: "2024-07-10",
      dueDate: "2024-07-24",
      status: "issued",
      renewalCount: 0,
      fineAmount: 0
    }
  ];

  const categories = ["All Categories", "Computer Science", "Electronics", "Management", "Mathematics", "Physics", "Chemistry"];

  const filteredBooks = books.filter(book =>
    (selectedCategory === "all" || selectedCategory === "All Categories" || book.category === selectedCategory) &&
    (selectedStatus === "all" || book.status === selectedStatus) &&
    (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
     book.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredTransactions = transactions.filter(transaction =>
    (selectedTransactionStatus === "all" || transaction.status === selectedTransactionStatus) &&
    (transaction.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     transaction.bookTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      case 'damaged': return 'bg-gray-100 text-gray-800';
      case 'issued': return 'bg-blue-100 text-blue-800';
      case 'returned': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'lost': return 'bg-gray-100 text-gray-800';
      case 'renewed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'low_stock': return AlertCircle;
      case 'out_of_stock': return XCircle;
      case 'damaged': return AlertCircle;
      case 'issued': return BookOpen;
      case 'returned': return CheckCircle;
      case 'overdue': return Clock;
      case 'lost': return XCircle;
      case 'renewed': return RotateCcw;
      default: return AlertCircle;
    }
  };

  const libraryStats = {
    totalBooks: books.reduce((sum, b) => sum + b.totalCopies, 0),
    availableBooks: books.reduce((sum, b) => sum + b.availableCopies, 0),
    issuedBooks: books.reduce((sum, b) => sum + (b.totalCopies - b.availableCopies), 0),
    overdueBooks: transactions.filter(t => t.status === 'overdue').length,
    totalMembers: 1250,
    activeTransactions: transactions.filter(t => t.status === 'issued' || t.status === 'overdue').length,
    totalFines: transactions.reduce((sum, t) => sum + t.fineAmount, 0)
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-3 w-3 fill-yellow-400/50 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-3 w-3 text-gray-300" />);
    }
    
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  return (
    <DashboardLayout title="Library Management" userRole="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Library Management System</h2>
            <p className="text-muted-foreground">Manage books, transactions, and library operations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button variant="outline">
              <Scan className="h-4 w-4 mr-2" />
              Barcode Scanner
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{libraryStats.totalBooks}</p>
                <p className="text-sm text-gray-600">Total Books</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{libraryStats.availableBooks}</p>
                <p className="text-sm text-gray-600">Available</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{libraryStats.issuedBooks}</p>
                <p className="text-sm text-gray-600">Issued</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{libraryStats.overdueBooks}</p>
                <p className="text-sm text-gray-600">Overdue</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{libraryStats.totalMembers}</p>
                <p className="text-sm text-gray-600">Members</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">{libraryStats.activeTransactions}</p>
                <p className="text-sm text-gray-600">Active Loans</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">₹{libraryStats.totalFines}</p>
                <p className="text-sm text-gray-600">Total Fines</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="books">Book Catalog</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="books" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search books..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category === "All Categories" ? "all" : category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => {
                const StatusIcon = getStatusIcon(book.status);
                
                return (
                  <Card key={book.id} className={`hover:shadow-lg transition-shadow border-l-4 ${
                    book.status === 'available' ? 'border-l-green-500' :
                    book.status === 'low_stock' ? 'border-l-yellow-500' :
                    book.status === 'out_of_stock' ? 'border-l-red-500' :
                    'border-l-gray-500'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <Book className="h-6 w-6 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg leading-tight">{book.title}</h3>
                            <p className="text-sm text-gray-600">by {book.author}</p>
                            <p className="text-xs text-gray-500">{book.publisher} • {book.edition}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(book.status)}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {book.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Book Details */}
                      <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">ISBN</p>
                            <p className="font-mono text-xs">{book.isbn}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Year</p>
                            <p className="font-medium">{book.publishYear}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-gray-600 text-sm">Location</p>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <p className="text-sm">{book.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600 text-sm">Category</p>
                            <Badge variant="outline" className="text-xs">{book.category}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-600 text-sm">Rating</p>
                            {renderStarRating(book.rating)}
                          </div>
                        </div>
                      </div>

                      {/* Availability */}
                      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{book.totalCopies}</p>
                          <p className="text-xs text-gray-600">Total Copies</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-lg font-bold ${
                            book.availableCopies > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {book.availableCopies}
                          </p>
                          <p className="text-xs text-gray-600">Available</p>
                        </div>
                      </div>

                      {/* Popularity Indicator */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Popularity</span>
                          <span>{book.popularity}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${book.popularity}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        {book.availableCopies > 0 && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Issue
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedTransactionStatus} onValueChange={setSelectedTransactionStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="issued">Issued</SelectItem>
                      <SelectItem value="returned">Returned</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="renewed">Renewed</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Advanced Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);
                const isOverdue = transaction.status === 'overdue';
                
                return (
                  <Card key={transaction.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{transaction.studentName}</h3>
                            <p className="text-sm text-gray-600">Roll: {transaction.rollNumber} | ID: {transaction.studentId}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{transaction.course}</Badge>
                              <Badge variant="outline">Book ID: {transaction.bookId}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(transaction.status)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {transaction.status}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-1">Issue: {transaction.issueDate}</p>
                        </div>
                      </div>

                      {/* Book Information */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Book className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium text-blue-800">{transaction.bookTitle}</h4>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-600">Issue Date</p>
                            <p className="text-sm font-medium">{transaction.issueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-600">Due Date</p>
                            <p className={`text-sm font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                              {transaction.dueDate}
                            </p>
                          </div>
                        </div>
                        {transaction.returnDate && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-xs text-gray-600">Return Date</p>
                              <p className="text-sm font-medium">{transaction.returnDate}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-600">Renewals</p>
                            <p className="text-sm font-medium">{transaction.renewalCount}</p>
                          </div>
                        </div>
                      </div>

                      {/* Fine Information */}
                      {transaction.fineAmount > 0 && (
                        <div className="mb-4 p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-800">Fine Amount</span>
                            </div>
                            <span className="text-lg font-bold text-red-600">₹{transaction.fineAmount}</span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {transaction.status === 'issued' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Return
                            </Button>
                            <Button variant="outline" size="sm">
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Renew
                            </Button>
                          </>
                        )}
                        {transaction.status === 'overdue' && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Return
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Reminder
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Library Members</CardTitle>
                <CardDescription>Manage library membership and user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">1,250</p>
                        <p className="text-sm text-gray-600">Total Members</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">1,180</p>
                        <p className="text-sm text-gray-600">Active Members</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">45</p>
                        <p className="text-sm text-gray-600">Suspended</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">25</p>
                        <p className="text-sm text-gray-600">Blocked</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Arjun Sharma", id: "YU2024001", course: "B.Tech CSE", booksIssued: 2, finesDue: 0, status: "active" },
                    { name: "Priya Patel", id: "YU2024002", course: "B.Tech ECE", booksIssued: 1, finesDue: 0, status: "active" },
                    { name: "Rahul Singh", id: "YU2024003", course: "MBA", booksIssued: 1, finesDue: 50, status: "suspended" }
                  ].map((member, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.id} • {member.course}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-sm font-medium">{member.booksIssued}</p>
                              <p className="text-xs text-gray-600">Books</p>
                            </div>
                            <div className="text-center">
                              <p className={`text-sm font-medium ${member.finesDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ₹{member.finesDue}
                              </p>
                              <p className="text-xs text-gray-600">Fines</p>
                            </div>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                            <Button size="sm" variant="outline">View Profile</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Books</CardTitle>
                  <CardDescription>Most borrowed books this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {books.slice(0, 5).map((book, index) => (
                      <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{book.title}</p>
                            <p className="text-xs text-gray-600">{book.author}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600">{book.popularity}%</p>
                          <p className="text-xs text-gray-600">popularity</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Distribution</CardTitle>
                  <CardDescription>Books by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categories.slice(1).map((category) => {
                      const categoryBooks = books.filter(b => b.category === category);
                      const percentage = (categoryBooks.length / books.length) * 100;
                      
                      return (
                        <div key={category}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{category}</span>
                            <span>{categoryBooks.length} books ({percentage.toFixed(1)}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Library Usage Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-600">85%</p>
                    <p className="text-sm text-blue-700">Collection Utilization</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">92%</p>
                    <p className="text-sm text-green-700">Member Satisfaction</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <Library className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">78%</p>
                    <p className="text-sm text-purple-700">Digital Access Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>Create various library reports and analytics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Circulation Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Books Issued Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Clock className="h-4 w-4 mr-2" />
                        Overdue Books Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Returns Report
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Fines Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Inventory Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <Archive className="h-4 w-4 mr-2" />
                        Complete Catalog
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Low Stock Alert
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Popular Books
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Usage Statistics
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Custom Report Generator</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Report Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select report type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="circulation">Circulation Report</SelectItem>
                            <SelectItem value="inventory">Inventory Report</SelectItem>
                            <SelectItem value="member">Member Report</SelectItem>
                            <SelectItem value="financial">Financial Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Date Range</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select date range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Library Settings</CardTitle>
                <CardDescription>Configure library policies and system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Loan Policies</h4>
                    <div className="space-y-2">
                      <Label>Maximum Books per User</Label>
                      <Input type="number" defaultValue="5" />
                    </div>
                    <div className="space-y-2">
                      <Label>Loan Duration (days)</Label>
                      <Input type="number" defaultValue="14" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Renewals</Label>
                      <Input type="number" defaultValue="2" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Fine Settings</h4>
                    <div className="space-y-2">
                      <Label>Daily Fine Rate (₹)</Label>
                      <Input type="number" defaultValue="2" />
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum Fine Amount (₹)</Label>
                      <Input type="number" defaultValue="100" />
                    </div>
                    <div className="space-y-2">
                      <Label>Grace Period (days)</Label>
                      <Input type="number" defaultValue="1" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">System Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {["Email Notifications", "SMS Reminders", "Auto Renewals", "Digital Access", "Barcode Scanning", "RFID Support"].map((setting) => (
                      <div key={setting} className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <label className="text-sm">{setting}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
