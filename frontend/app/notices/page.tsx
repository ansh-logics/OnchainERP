import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { 
  GraduationCap, 
  ArrowLeft, 
  Bell, 
  Search, 
  Calendar, 
  Filter,
  Download,
  Pin,
  AlertTriangle,
  Info,
  CheckCircle
} from "lucide-react"
import { mockNotices } from "@/lib/mock-data"

export default function NoticesPage() {
  const notices = mockNotices

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case 'urgent':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'exam':
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case 'fee':
        return <Info className="h-5 w-5 text-yellow-600" />
      case 'academic':
        return <GraduationCap className="h-5 w-5 text-green-600" />
      case 'admission':
        return <Bell className="h-5 w-5 text-purple-600" />
      default:
        return <Info className="h-5 w-5 text-gray-600" />
    }
  }

  const getNoticeColor = (type: string) => {
    switch (type) {
      case 'urgent':
        return 'border-red-200 bg-red-50'
      case 'exam':
        return 'border-blue-200 bg-blue-50'
      case 'fee':
        return 'border-yellow-200 bg-yellow-50'
      case 'academic':
        return 'border-green-200 bg-green-50'
      case 'admission':
        return 'border-purple-200 bg-purple-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">ABC College</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Notices & Announcements
            </h1>
            <p className="text-xl text-muted-foreground">
              Stay updated with the latest news, announcements, and important information from ABC College
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search notices..." className="pl-9" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </section>

      {/* Notices */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {notices.map((notice) => (
              <Card key={notice.id} className={`${getNoticeColor(notice.type)} border-l-4`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getNoticeIcon(notice.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {notice.type.toUpperCase()}
                          </Badge>
                          {notice.type === 'urgent' && (
                            <Badge variant="destructive" className="text-xs">
                              <Pin className="h-3 w-3 mr-1" />
                              URGENT
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl mb-2">{notice.title}</CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Published: {new Date(notice.publishedDate).toLocaleDateString()}
                          </div>
                          {notice.expiryDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              Expires: {new Date(notice.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {notice.content}
                  </p>
                  
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Attachments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {notice.attachments.map((attachment, index) => (
                          <Button key={index} variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-2" />
                            {attachment}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Target Audience:</span>
                      <div className="flex gap-1">
                        {notice.targetAudience.map((audience) => (
                          <Badge key={audience} variant="secondary" className="text-xs">
                            {audience === 'all' ? 'Everyone' : audience.charAt(0).toUpperCase() + audience.slice(1)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      Read More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Notices
            </Button>
          </div>
        </div>
      </section>

      {/* Notice Categories */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">Notice Categories</h2>
            <p className="text-muted-foreground">Browse notices by category</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Urgent</h3>
              <p className="text-xs text-muted-foreground mt-1">1 notice</p>
            </Card>
            
            <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
              <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Exam</h3>
              <p className="text-xs text-muted-foreground mt-1">1 notice</p>
            </Card>
            
            <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
              <Info className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Fee</h3>
              <p className="text-xs text-muted-foreground mt-1">1 notice</p>
            </Card>
            
            <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
              <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Academic</h3>
              <p className="text-xs text-muted-foreground mt-1">0 notices</p>
            </Card>
            
            <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
              <Bell className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">Admission</h3>
              <p className="text-xs text-muted-foreground mt-1">0 notices</p>
            </Card>
            
            <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
              <Info className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h3 className="font-medium text-sm">General</h3>
              <p className="text-xs text-muted-foreground mt-1">1 notice</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Bell className="h-5 w-5" />
                Stay Updated
              </CardTitle>
              <CardDescription>
                Get important notices delivered to your email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 max-w-md mx-auto">
                <Input placeholder="Enter your email" type="email" />
                <Button>Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                You can unsubscribe at any time. We respect your privacy.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
