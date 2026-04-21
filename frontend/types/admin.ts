export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

export interface UserRow {
  id: string
  name: string
  username: string
  email: string
  mobile: string | null
  country: string | null
  created_at: string
  balance: string
  email_verified: boolean
  is_banned: boolean
  role: string
  total_courses?: number
  total_earnings?: string
}

export interface CourseRow {
  id: string
  title: string
  slug: string
  thumbnail: string | null
  price: string
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  created_at: string
  instructor: { name: string; email: string }
  category: { name: string } | null
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  children?: Category[]
}

export interface PaymentRow {
  id: string
  trx_id: string
  gateway: string
  amount: string
  status: "PENDING" | "COMPLETED" | "FAILED"
  initiated_at: string
  completed_at: string | null
  user: { id: string; name: string; email: string }
  course: { id: string; title: string } | null
}

export interface WithdrawalRow {
  id: string
  amount: string
  method: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  requested_at: string
  processed_at: string | null
  teacher: { id: string; name: string; email: string; avatar: string | null }
}

export interface DashboardStats {
  totalUsers: number
  activeUsers: number
  emailVerified: number
  totalTeachers: number
  activeTeachers: number
  totalCourses: number
  pendingCourses: number
  approvedCourses: number
  rejectedCourses: number
  totalPayments: string
  pendingPayments: string
  totalWithdrawals: string
  pendingWithdrawals: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
}
