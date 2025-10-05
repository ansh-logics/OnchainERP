"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentUser } from "@/lib/auth";
import { mockLibraryData } from "@/lib/mock-data";
import { 
  Book, 
  Search, 
  Calendar, 
  Clock,
  Download,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  Star,
  Filter,
  Eye,
  Loader2,
  DollarSign,
  User,
  Hash
} from "lucide-react";
import { toast } from "sonner";

// Mock available books for search
const mockAvailableBooks = [
  {
    id: '1',
    title: 'Data Structures and Algorithms in Java',
    author: 'Robert Lafore',
    isbn: '9780672324536',
    category: 'Computer Science',
    availability: 'Available',
    rating: 4.5,
    location: 'CS Section - A2'
  },
  {
    id: '2',
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '9781118063330',
    category: 'Computer Science',
    availability: 'Available',
    rating: 4.3,
    location: 'CS Section - A3'
  },
  {
    id: '3',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    isbn: '9780132126953',
    category: 'Computer Science',
    availability: 'Checked Out',
    rating: 4.4,
    location: 'CS Section - A4'
  },
  {
    id: '4',
    title: 'Software Engineering',
    author: 'Ian Sommerville',
    isbn: '9780133943030',
    category: 'Computer Science',
    availability: 'Available',
    rating: 4.2,
    location: 'CS Section - A5'
  },
];

export default function StudentLibraryPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [router]);

  if (loading || !user) {
    return (
      <DashboardLayout title="Library" userRole="student">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading library information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredBooks = mockAvailableBooks.filter(book => 
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isOverdue = (dueDate: string) => {
    return getDaysRemaining(dueDate) < 0;
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <DashboardLayout title="Library" userRole="student">
      <div className="space-y-6">
        {/* Library Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockLibraryData.borrowedBooks.length}</div>
              <p className="text-xs text-muted-foreground">Currently reading</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reserved Books</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{mockLibraryData.reservedBooks}</div>
              <p className="text-xs text-muted-foreground">Waiting for pickup</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {mockLibraryData.borrowedBooks.filter(book => isOverdue(book.dueDate)).length}
              </div>
              <p className="text-xs text-muted-foreground">Need to return</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">₹{mockLibraryData.fines}</div>
              <p className="text-xs text-muted-foreground">Outstanding amount</p>
            </CardContent>
          </Card>
        </div>

        {/* Library Tabs */}
        <Tabs defaultValue="borrowed" className="space-y-4">
          <TabsList>
            <TabsTrigger value="borrowed">My Books ({mockLibraryData.borrowedBooks.length})</TabsTrigger>
            <TabsTrigger value="search">Search Books</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Borrowed Books */}
          <TabsContent value="borrowed" className="space-y-4">
            {mockLibraryData.borrowedBooks.length > 0 ? (
              mockLibraryData.borrowedBooks.map((book) => {
                const daysRemaining = getDaysRemaining(book.dueDate);
                const overdue = isOverdue(book.dueDate);
                
                return (
                  <Card key={book.id} className={`${overdue ? 'border-red-200 bg-red-50' : ''}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{book.title}</CardTitle>
                          <CardDescription>By {book.author}</CardDescription>
                        </div>
                        <Badge variant={overdue ? 'destructive' : book.status === 'borrowed' ? 'default' : 'secondary'}>
                          {overdue ? 'Overdue' : book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">ISBN</p>
                            <p className="text-muted-foreground">{book.isbn}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Borrowed</p>
                            <p className="text-muted-foreground">{new Date(book.borrowDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Due Date</p>
                            <p className={`${overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                              {new Date(book.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`h-4 w-4 ${overdue ? 'text-red-600' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="font-medium">Days {overdue ? 'Overdue' : 'Remaining'}</p>
                            <p className={`${overdue ? 'text-red-600 font-semibold' : 'text-muted-foreground'}`}>
                              {Math.abs(daysRemaining)} days
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => toast.success(`Renewing ${book.title} (Demo)`)}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Renew
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.success(`Returning ${book.title} (Demo)`)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Return
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center text-muted-foreground">
                    <Book className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No books currently borrowed</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Search Books */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Search Library Catalog</CardTitle>
                <CardDescription>Find books, journals, and other resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, author, or ISBN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {filteredBooks.map((book) => (
                <Card key={book.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{book.title}</CardTitle>
                        <CardDescription>By {book.author}</CardDescription>
                        <div className="flex items-center gap-1">
                          {getRatingStars(book.rating)}
                          <span className="text-sm text-muted-foreground ml-1">({book.rating})</span>
                        </div>
                      </div>
                      <Badge variant={book.availability === 'Available' ? 'default' : 'secondary'}>
                        {book.availability}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium">ISBN</p>
                        <p className="text-muted-foreground">{book.isbn}</p>
                      </div>
                      <div>
                        <p className="font-medium">Category</p>
                        <p className="text-muted-foreground">{book.category}</p>
                      </div>
                      <div>
                        <p className="font-medium">Location</p>
                        <p className="text-muted-foreground">{book.location}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {book.availability === 'Available' ? (
                        <Button 
                          size="sm"
                          onClick={() => toast.success(`Borrowing ${book.title} (Demo)`)}
                        >
                          <BookOpen className="h-4 w-4 mr-1" />
                          Borrow
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => toast.success(`Reserved ${book.title} (Demo)`)}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Reserve
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => toast.success(`Viewing details for ${book.title} (Demo)`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* History */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Borrowing History</CardTitle>
                <CardDescription>Your past library transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLibraryData.borrowedBooks.map((book) => (
                    <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{book.title}</p>
                        <p className="text-sm text-muted-foreground">By {book.author}</p>
                        <p className="text-sm text-muted-foreground">
                          Borrowed: {new Date(book.borrowDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="default">Currently Borrowed</Badge>
                    </div>
                  ))}
                  
                  {/* Some mock historical entries */}
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">The Art of Computer Programming</p>
                      <p className="text-sm text-muted-foreground">By Donald E. Knuth</p>
                      <p className="text-sm text-muted-foreground">
                        Borrowed: 2024-01-10 | Returned: 2024-01-24
                      </p>
                    </div>
                    <Badge variant="secondary">Returned</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Clean Code</p>
                      <p className="text-sm text-muted-foreground">By Robert C. Martin</p>
                      <p className="text-sm text-muted-foreground">
                        Borrowed: 2023-12-15 | Returned: 2024-01-05
                      </p>
                    </div>
                    <Badge variant="secondary">Returned</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => toast.success('Opening digital library (Demo)')}
              >
                <Download className="h-5 w-5" />
                Digital Library
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => toast.success('Viewing research papers (Demo)')}
              >
                <BookOpen className="h-5 w-5" />
                Research Papers
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => toast.success('Contacting librarian (Demo)')}
              >
                <User className="h-5 w-5" />
                Contact Librarian
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2"
                onClick={() => router.push('/student/fees')}
              >
                <DollarSign className="h-5 w-5" />
                Pay Fines
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
