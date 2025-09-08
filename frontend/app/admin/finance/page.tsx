import { AuthGuard } from "@/components/auth-guard"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminFinance } from "@/components/admin/admin-finance"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "BarChart3" as const },
  { name: "Users", href: "/admin/users", icon: "Users" as const },
  { name: "Courses", href: "/admin/courses", icon: "BookOpen" as const },
  { name: "Enrollment", href: "/admin/enrollment", icon: "Calendar" as const },
  { name: "Finance", href: "/admin/finance", icon: "DollarSign" as const, current: true },
  { name: "Settings", href: "/admin/settings", icon: "Settings" as const },
  { name: "Profile", href: "/admin/profile", icon: "User" as const },
]

export default function AdminFinancePage() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <DashboardLayout userRole="admin" navigation={navigation}>
        <AdminFinance />
      </DashboardLayout>
    </AuthGuard>
  )
}
