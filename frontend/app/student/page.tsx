import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StudentDashboard } from "@/components/student/student-dashboard"

const navigation = [
  { name: "Dashboard", href: "/student", icon: "BookOpen" as const, current: true },
  { name: "Courses", href: "/student/courses", icon: "GraduationCap" as const },
  { name: "Schedule", href: "/student/schedule", icon: "Calendar" as const },
  { name: "Assignments", href: "/student/assignments", icon: "FileText" as const },
  { name: "Grades", href: "/student/grades", icon: "Clock" as const },
  { name: "Profile", href: "/student/profile", icon: "User" as const },
]

export default function StudentPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout userRole="student" navigation={navigation}>
        <StudentDashboard />
      </DashboardLayout>
    </AuthGuard>
  )
}
