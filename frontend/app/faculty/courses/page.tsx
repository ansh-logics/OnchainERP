import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FacultyCourses } from "@/components/faculty/faculty-courses"

const navigation = [
  { name: "Dashboard", href: "/faculty", icon: "BarChart3" as const },
  { name: "My Courses", href: "/faculty/courses", icon: "BookOpen" as const, current: true },
  { name: "Students", href: "/faculty/students", icon: "Users" as const },
  { name: "Schedule", href: "/faculty/schedule", icon: "Calendar" as const },
  { name: "Grading", href: "/faculty/grading", icon: "FileText" as const },
  { name: "Profile", href: "/faculty/profile", icon: "User" as const },
]

export default function FacultyCoursesPage() {
  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardLayout userRole="faculty" navigation={navigation}>
        <FacultyCourses />
      </DashboardLayout>
    </AuthGuard>
  )
}
