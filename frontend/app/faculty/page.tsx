import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { FacultyDashboard } from "@/components/faculty/faculty-dashboard"

const navigation = [
  { name: "Dashboard", href: "/faculty", icon: "BarChart3" as const, current: true },
  { name: "My Courses", href: "/faculty/courses", icon: "BookOpen" as const },
  { name: "Students", href: "/faculty/students", icon: "Users" as const },
  { name: "Schedule", href: "/faculty/schedule", icon: "Calendar" as const },
  { name: "Grading", href: "/faculty/grading", icon: "FileText" as const },
  { name: "Profile", href: "/faculty/profile", icon: "User" as const },
]

export default function FacultyPage() {
  return (
    <AuthGuard allowedRoles={["faculty"]}>
      <DashboardLayout userRole="faculty" navigation={navigation}>
        <FacultyDashboard />
      </DashboardLayout>
    </AuthGuard>
  )
}
