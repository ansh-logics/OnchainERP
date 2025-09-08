import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminUsers } from "@/components/admin/admin-users"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "BarChart3" as const },
  { name: "Users", href: "/admin/users", icon: "Users" as const, current: true },
  { name: "Courses", href: "/admin/courses", icon: "BookOpen" as const },
  { name: "Enrollment", href: "/admin/enrollment", icon: "Calendar" as const },
  { name: "Finance", href: "/admin/finance", icon: "DollarSign" as const },
  { name: "Settings", href: "/admin/settings", icon: "Settings" as const },
  { name: "Profile", href: "/admin/profile", icon: "User" as const },
]

export default function AdminUsersPage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout userRole="admin" navigation={navigation}>
        <AdminUsers />
      </DashboardLayout>
    </AuthGuard>
  )
}
