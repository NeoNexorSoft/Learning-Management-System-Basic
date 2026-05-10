export interface Student {
  id: string
  name: string
  email: string
  avatar: string
  enrolledCourses: number
  completedCourses: number
  pendingAssignments: number
}

export interface Course {
  id: string
  title: string
  teacher: string
  progress: number
  category: string
  status: 'in-progress' | 'completed' | 'not-started'
  thumbnail: string
  totalLessons: number
  completedLessons: number
}

export interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  status: 'pending' | 'submitted' | 'graded'
  marks: number | null
  totalMarks: number
}

export interface Result {
  id: string
  course: string
  assignment: string
  marks: number
  totalMarks: number
  grade: string
  date: string
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  mobile: string
  bio: string
  avatar: string
}

export interface TeacherCourse {
  id: string
  title: string
  subtitle: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  price: number
  totalStudents: number
  totalLessons: number
  status: 'draft' | 'pending' | 'approved'
  thumbnail: string
  createdAt: string
  publishedDate: string | null
  rating: number
  totalReviews: number
  totalEarnings: number
}

export interface Enrollment {
  id: string
  studentName: string
  studentEmail: string
  courseTitle: string
  enrolledAt: string
  progress: number
  status: 'active' | 'completed'
}

export interface TeacherStudent {
  id: string
  name: string
  email: string
  avatar: string
  coursesEnrolled: number
  progress: number
  lastActive: string
}

export interface Transaction {
  id: string
  studentName: string
  course: string
  amount: number
  date: string
  status: 'completed' | 'refunded' | 'pending'
}

export interface WithdrawRequest {
  id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  processedAt: string | null
  method: string
}

export interface Review {
  id: string
  studentName: string
  courseTitle: string
  rating: number
  comment: string
  date: string
}

export interface TeacherSettings {
  firstName: string
  lastName: string
  email: string
  mobile: string
  bio: string
  avatar: string
}
