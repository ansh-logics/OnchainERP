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
  Eye
} from "lucide-react";

export default function StudentLibraryPage() {
  const [user, setUser] = useState<{name: string; role: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      router.push('/auth/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock library data
  const borrowedBooks = [
    {
      id: 1,
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      author: "Robert C. Martin",
      isbn: "978-0132350884",
      borrowDate: "2024-09-15",
      dueDate: "2024-10-15",
      status: "borrowed",
      renewCount: 1,
      maxRenewals: 3
    },
    {
      id: 2,
      title: "Design Patterns: Elements of Reusable Object-Oriented Software",
      author: "Gang of Four",
      isbn: "978-0201633612",
      borrowDate: "2024-09-20",
      dueDate: "2024-10-20",
      status: "borrowed",
      renewCount: 0,
      maxRenewals: 3
    },
    {
      id: 3,
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      isbn: "978-0262033848",
      borrowDate: "2024-08-10",
      dueDate: "2024-09-10",
      status: "overdue",
      renewCount: 3,
      maxRenewals: 3,
      fine: 25.50
    }
  ];

  const reservedBooks = [
    {
      id: 4,
      title: "Database System Concepts",
      author: "Abraham Silberschatz",
      isbn: "978-0073523323",
      reserveDate: "2024-10-01",
      expectedAvailability: "2024-10-18",
      queuePosition: 2,
      status: "reserved"
    }
  ];

  const searchResults = [
    {
      id: 5,
      title: "Computer Networks",
      author: "Andrew S. Tanenbaum",
      isbn: "978-0132126953",
      availability: "available",
      location: "Section CS - Shelf 15",
      copies: { total: 5, available: 2 }
    },
    {
      id: 6,
      title: "Operating System Concepts",
      author: "Abraham Silberschatz",
      isbn: "978-1118063330",
      availability: "borrowed",
      location: "Section CS - Shelf 12",
      copies: { total: 3, available: 0 },
      nextAvailable: "2024-10-22"
    },
    {
      id: 7,
      title: "Software Engineering: A Practitioner's Approach",
      author: "Roger S. Pressman",
      isbn: "978-0078022128",
      availability: "available",
      location: "Section SE - Shelf 8",
      copies: { total: 4, available: 3 }
    }
  ];

  const digitalResources = [
    {
      id: 1,
      title: "IEEE Xplore Digital Library",
      type: "Database",
      description: "Access to IEEE journals, conferences, and standards",
      url: "https://ieeexplore.ieee.org",
      category: "Engineering"
    },
    {
      id: 2,
      title: "ACM Digital Library",
      type: "Database",
      description: "Computing and information technology research",
      url: "https://dl.acm.org",
      category: "Computer Science"
    },
    {
      id: 3,
      title: "Springer Link",
      type: "E-books",
      description: "Scientific, technical and medical content",
      url: "https://link.springer.com",
      category: "Science"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'available': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'borrowed': return <BookOpen className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'reserved': return <Clock className="h-4 w-4" />;
      case 'available': return <CheckCircle className="h-4 w-4" />;
      default: return <Book className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalBorrowed = borrowedBooks.length;
  const overdueBooks = borrowedBooks.filter(book => book.status === 'overdue').length;
  const totalFines = borrowedBooks.reduce((sum, book) => sum + (book.fine || 0), 0);
  const activeReservations = reservedBooks.length;

  return (
    <DashboardLayout title="Library" userRole="student">
      <div className="space-y-6">
        {/* Library Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Books Borrowed</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBorrowed}</div>
              <p className="text-xs text-muted-foreground">Currently borrowed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueBooks}</div>
              <p className="text-xs text-muted-foreground">Need immediate return</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Fines</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">${totalFines.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Pending payment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservations</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeReservations}</div>
              <p className="text-xs text-muted-foreground">Active reservations</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="borrowed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="borrowed">My Books ({totalBorrowed})</TabsTrigger>
            <TabsTrigger value="search">Search Catalog</TabsTrigger>
            <TabsTrigger value="reservations">Reservations ({activeReservations})</TabsTrigger>
            <TabsTrigger value="digital">Digital Resources</TabsTrigger>
          </TabsList>

          {/* Borrowed Books */}
          <TabsContent value="borrowed" className="space-y-4">
            {borrowedBooks.length > 0 ? (
              <div className="space-y-4">
                {borrowedBooks.map((book) => {
                  const daysRemaining = getDaysRemaining(book.dueDate);
                  const isOverdue = book.status === 'overdue';
                  const isDueSoon = daysRemaining <= 3 && daysRemaining > 0;
                  
                  return (
                    <Card key={book.id} className={`border-l-4 ${isOverdue ? 'border-l-red-500' : isDueSoon ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{book.title}</CardTitle>
                            <CardDescription>
                              by {book.author} • ISBN: {book.isbn}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(book.status)}>
                              {getStatusIcon(book.status)}
                              <span className="ml-1 capitalize">{book.status}</span>
                            </Badge>
                            {isDueSoon && !isOverdue && (
                              <Badge variant="outline" className="text-yellow-700 border-yellow-300">
                                Due Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Borrowed Date</p>
                                <p className="text-gray-600">{new Date(book.borrowDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Due Date</p>
                                <p className={`text-gray-600 ${isOverdue ? 'text-red-600 font-medium' : isDueSoon ? 'text-yellow-600 font-medium' : ''}`}>
                                  {new Date(book.dueDate).toLocaleDateString()}
                                  {isOverdue && ` (${Math.abs(daysRemaining)} days overdue)`}
                                  {isDueSoon && !isOverdue && ` (${daysRemaining} days remaining)`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium">Renewals</p>
                                <p className="text-gray-600">{book.renewCount}/{book.maxRenewals} used</p>
                              </div>
                            </div>
                          </div>

                          {book.fine && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="font-medium text-red-800">Fine: ${book.fine.toFixed(2)}</span>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            {book.renewCount < book.maxRenewals && !isOverdue && (
                              <Button size="sm">
                                Renew Book
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              Return Book
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Digital Copy
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Book className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Books Borrowed</h3>
                  <p className="text-gray-600 text-center">
                    You haven&apos;t borrowed any books currently. Search the catalog to find books to borrow.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Search Catalog */}
          <TabsContent value="search" className="space-y-4">
            {/* Search Interface */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search books by title, author, ISBN..." className="pl-10" />
                </div>
              </div>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </div>

            {/* Search Results */}
            <div className="space-y-4">
              {searchResults.map((book) => (
                <Card key={book.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                        <p className="text-gray-600 mb-2">by {book.author}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span>ISBN: {book.isbn}</span>
                          <span>Location: {book.location}</span>
                          <span>Available: {book.copies.available}/{book.copies.total}</span>
                        </div>
                        {book.nextAvailable && (
                          <p className="text-sm text-yellow-600">
                            Next available: {new Date(book.nextAvailable).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(book.availability)}>
                          {getStatusIcon(book.availability)}
                          <span className="ml-1 capitalize">{book.availability}</span>
                        </Badge>
                        <div className="flex gap-2">
                          {book.availability === 'available' ? (
                            <Button size="sm">Borrow</Button>
                          ) : (
                            <Button size="sm" variant="outline">Reserve</Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reservations */}
          <TabsContent value="reservations" className="space-y-4">
            {reservedBooks.length > 0 ? (
              <div className="space-y-4">
                {reservedBooks.map((book) => (
                  <Card key={book.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{book.title}</CardTitle>
                          <CardDescription>
                            by {book.author} • ISBN: {book.isbn}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(book.status)}>
                          {getStatusIcon(book.status)}
                          <span className="ml-1 capitalize">{book.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Reserved On</p>
                              <p className="text-gray-600">{new Date(book.reserveDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Expected Availability</p>
                              <p className="text-gray-600">{new Date(book.expectedAvailability).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium">Queue Position</p>
                              <p className="text-gray-600">#{book.queuePosition}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Cancel Reservation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Star className="h-12 w-12 text-yellow-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Reservations</h3>
                  <p className="text-gray-600 text-center">
                    You don&apos;t have any book reservations at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Digital Resources */}
          <TabsContent value="digital" className="space-y-4">
            <div className="grid gap-4">
              {digitalResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{resource.title}</h3>
                        <p className="text-gray-600 mb-2">{resource.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{resource.type}</Badge>
                          <Badge variant="outline">{resource.category}</Badge>
                        </div>
                      </div>
                      <Button>
                        Access Resource
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
