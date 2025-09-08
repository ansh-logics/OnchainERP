import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminEnrollment } from "@/components/admin/admin-enrollment"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "BarChart3" as const },
  { name: "Users", href: "/admin/users", icon: "Users" as const },
  { name: "Courses", href: "/admin/courses", icon: "BookOpen" as const },
  { name: "Enrollment", href: "/admin/enrollment", icon: "Calendar" as const, current: true },
  { name: "Finance", href: "/admin/finance", icon: "DollarSign" as const },
  { name: "Settings", href: "/admin/settings", icon: "Settings" as const },
  { name: "Profile", href: "/admin/profile", icon: "User" as const },
]

export default function AdminEnrollmentPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout userRole="admin" navigation={navigation}>
        <AdminEnrollment />
      </DashboardLayout>
    </AuthGuard>
  )
}
