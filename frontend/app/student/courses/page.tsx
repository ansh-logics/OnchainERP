import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { StudentCourses } from "@/components/student/student-courses"

const navigation = [
  { name: "Dashboard", href: "/student", icon: "BookOpen" as const },
  { name: "Courses", href: "/student/courses", icon: "GraduationCap" as const, current: true },
  { name: "Schedule", href: "/student/schedule", icon: "Calendar" as const },
  { name: "Assignments", href: "/student/assignments", icon: "FileText" as const },
  { name: "Grades", href: "/student/grades", icon: "Clock" as const },
  { name: "Profile", href: "/student/profile", icon: "User" as const },
]

export default function StudentCoursesPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      <DashboardLayout userRole="student" navigation={navigation}>
        <StudentCourses />
      </DashboardLayout>
    </AuthGuard>
  )
}
