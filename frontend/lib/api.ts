import {
  mockStudent, mockCourses, mockAssignments, mockResults,
  mockTeacher, mockTeacherCourses, mockEnrollments,
  mockTeacherStudents, mockTransactions, mockWithdrawRequests,
  mockReviews, mockTeacherSettings,
} from './mock-data'

// 🔁 Flip this to false when backend is ready
const USE_MOCK = true
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export async function getStudent() {
  if (USE_MOCK) return mockStudent
  const res = await fetch(`${API_BASE}/api/student/me`)
  return res.json()
}

export async function getCourses() {
  if (USE_MOCK) return mockCourses
  const res = await fetch(`${API_BASE}/api/courses`)
  return res.json()
}

export async function getAssignments() {
  if (USE_MOCK) return mockAssignments
  const res = await fetch(`${API_BASE}/api/assignments`)
  return res.json()
}

export async function getResults() {
  if (USE_MOCK) return mockResults
  const res = await fetch(`${API_BASE}/api/results`)
  return res.json()
}

// ── Teacher API ───────────────────────────────────────────────────────────

export async function getTeacher() {
  if (USE_MOCK) return mockTeacher
  const res = await fetch(`${API_BASE}/api/teacher/settings`)
  return res.json()
}

export async function getTeacherCourses() {
  if (USE_MOCK) return mockTeacherCourses
  const res = await fetch(`${API_BASE}/api/teacher/courses`)
  return res.json()
}

export async function getEnrollments() {
  if (USE_MOCK) return mockEnrollments
  const res = await fetch(`${API_BASE}/api/teacher/enrollments`)
  return res.json()
}

export async function getTeacherStudents() {
  if (USE_MOCK) return mockTeacherStudents
  const res = await fetch(`${API_BASE}/api/teacher/students`)
  return res.json()
}

export async function getTransactions() {
  if (USE_MOCK) return mockTransactions
  const res = await fetch(`${API_BASE}/api/teacher/transactions`)
  return res.json()
}

export async function getWithdrawRequests() {
  if (USE_MOCK) return mockWithdrawRequests
  const res = await fetch(`${API_BASE}/api/teacher/withdraw`)
  return res.json()
}

export async function getReviews() {
  if (USE_MOCK) return mockReviews
  const res = await fetch(`${API_BASE}/api/teacher/reviews`)
  return res.json()
}

export async function getTeacherSettings() {
  if (USE_MOCK) return mockTeacherSettings
  const res = await fetch(`${API_BASE}/api/teacher/settings`)
  return res.json()
}
