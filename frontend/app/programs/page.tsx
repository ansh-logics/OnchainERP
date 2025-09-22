import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  GraduationCap, 
  ArrowLeft, 
  Users, 
  Clock, 
  Award, 
  BookOpen,
  TrendingUp,
  Building,
  Cpu,
  Wrench
} from "lucide-react"

const programs = [
  {
    id: 'cse',
    title: 'Computer Science & Engineering',
    duration: '4 Years',
    degree: 'B.Tech',
    icon: Cpu,
    description: 'Comprehensive program covering software development, algorithms, AI, machine learning, and system design with hands-on industry projects.',
    seats: 120,
    placementRate: 95,
    averagePackage: '₹8.5 LPA',
    highlights: [
      'Industry-aligned curriculum with latest technologies',
      'State-of-the-art computer labs and development environment',
      'Internship opportunities with top tech companies',
      'Research projects in AI, ML, and emerging technologies'
    ],
    subjects: [
      'Programming Fundamentals',
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Computer Networks',
      'Machine Learning',
      'Software Engineering',
      'Web Development',
      'Mobile App Development'
    ]
  },
  {
    id: 'ece',
    title: 'Electronics & Communication Engineering',
    duration: '4 Years',
    degree: 'B.Tech',
    icon: Building,
    description: 'Focus on electronics, communication systems, embedded systems, and IoT technologies with practical laboratory experience.',
    seats: 100,
    placementRate: 92,
    averagePackage: '₹7.2 LPA',
    highlights: [
      'Advanced electronics and communication labs',
      'Hands-on experience with embedded systems',
      'Industry partnerships for practical training',
      'Research opportunities in IoT and 5G technologies'
    ],
    subjects: [
      'Electronic Circuits',
      'Digital Signal Processing',
      'Communication Systems',
      'Microprocessors',
      'VLSI Design',
      'Embedded Systems',
      'Wireless Networks',
      'IoT Applications'
    ]
  },
  {
    id: 'me',
    title: 'Mechanical Engineering',
    duration: '4 Years',
    degree: 'B.Tech',
    icon: Wrench,
    description: 'Traditional mechanical engineering with modern manufacturing technologies, automation, and sustainable engineering practices.',
    seats: 80,
    placementRate: 88,
    averagePackage: '₹6.8 LPA',
    highlights: [
      'Modern manufacturing and automation labs',
      'CAD/CAM software training',
      'Industry visits and practical exposure',
      'Research in renewable energy and sustainability'
    ],
    subjects: [
      'Engineering Mechanics',
      'Thermodynamics',
      'Machine Design',
      'Manufacturing Processes',
      'Fluid Mechanics',
      'Heat Transfer',
      'Automation & Robotics',
      'Sustainable Engineering'
    ]
  }
]

export default function ProgramsPage() {
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
              Our Academic Programs
            </h1>
            <p className="text-xl text-muted-foreground">
              Choose from our comprehensive range of engineering programs designed to prepare you for the future
            </p>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {programs.map((program) => {
              const IconComponent = program.icon
              return (
                <Card key={program.id} className="overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Program Info */}
                    <div className="lg:col-span-2 p-8">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <IconComponent className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold mb-2">{program.title}</h2>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {program.duration}
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {program.degree}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {program.description}
                      </p>

                      <div className="mb-6">
                        <h3 className="font-semibold mb-3">Program Highlights:</h3>
                        <ul className="space-y-2">
                          {program.highlights.map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-muted-foreground">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Key Subjects:</h3>
                        <div className="flex flex-wrap gap-2">
                          {program.subjects.map((subject, index) => (
                            <Badge key={index} variant="outline">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="bg-muted/50 p-8">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-semibold mb-4">Program Statistics</h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Available Seats</span>
                              </div>
                              <span className="font-semibold">{program.seats}</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Placement Rate</span>
                              </div>
                              <span className="font-semibold text-green-600">{program.placementRate}%</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Award className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Average Package</span>
                              </div>
                              <span className="font-semibold">{program.averagePackage}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Link href="/admissions">
                            <Button className="w-full">
                              Apply for This Program
                            </Button>
                          </Link>
                          <Button variant="outline" className="w-full">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Download Brochure
                          </Button>
                        </div>

                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-2">
                            Need more information?
                          </p>
                          <Link href="/contact" className="text-primary hover:underline text-sm">
                            Contact Admissions Team
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Ready to Start Your Journey?</CardTitle>
                <CardDescription>
                  Join thousands of successful graduates who have built their careers with ABC College
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/admissions">
                    <Button size="lg" className="px-8">
                      Apply Now
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg" className="px-8">
                      Schedule Campus Visit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
