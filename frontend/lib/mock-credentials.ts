export type DemoUser = {
  id: string
  email: string
  role: "student" | "teacher"
  name: string
  avatar: string
}

type Credential = DemoUser & { password: string }

const CREDENTIALS: Credential[] = [
  { id: "student_001", email: "student@demo.com",  password: "student123", role: "student", name: "John Doe",        avatar: "https://i.pravatar.cc/150?u=student@demo.com"  },
  { id: "student_002", email: "student2@demo.com", password: "student456", role: "student", name: "Sarah Kim",       avatar: "https://i.pravatar.cc/150?u=student2@demo.com" },
  { id: "teacher_001", email: "teacher@demo.com",  password: "teacher123", role: "teacher", name: "Lucy Dominguez",  avatar: "https://i.pravatar.cc/150?u=teacher@demo.com"  },
  { id: "teacher_002", email: "teacher2@demo.com", password: "teacher456", role: "teacher", name: "James Carter",    avatar: "https://i.pravatar.cc/150?u=teacher2@demo.com" },
]

export function findUser(email: string, password: string): DemoUser | null {
  const match = CREDENTIALS.find(
    (u) => u.email === email.toLowerCase() && u.password === password
  )
  if (!match) return null
  const { password: _pw, ...user } = match
  return user
}

export function getDemoByRole(role: "student" | "teacher"): Credential[] {
  return CREDENTIALS.filter((u) => u.role === role)
}
