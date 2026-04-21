"use client"

import {
  createContext, useContext, useState, useEffect,
  type ReactNode,
} from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"
import {
  getToken, setToken, removeToken,
  getUser, setUser, removeUser,
  type AuthUser,
} from "@/lib/auth"

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string, role: "student" | "teacher") => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null)
  const [loading, setLoading]  = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = getUser()
    const token      = getToken()
    if (storedUser && token) setUserState(storedUser)
    setLoading(false)
  }, [])

  // Guard against back-button navigation landing a user on a panel they no longer
  // have a valid session for (e.g. student presses back into /teacher/* or vice versa).
  useEffect(() => {
    function handlePopState() {
      const path = window.location.pathname
      const cookieRole = document.cookie
        .split("; ")
        .find((r) => r.startsWith("demo_role="))
        ?.split("=")[1] as "student" | "teacher" | undefined

      const onStudent = path.startsWith("/student")
      const onTeacher = path.startsWith("/teacher")

      if ((onStudent && cookieRole !== "student") || (onTeacher && cookieRole !== "teacher")) {
        removeToken()
        removeUser()
        document.cookie = "demo_role=; path=/; max-age=0; SameSite=Lax"
        setUserState(null)
        router.push(onTeacher ? "/auth/login/teacher" : "/auth/login/student")
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [router])

  async function login(email: string, password: string, role: "student" | "teacher") {
    // Always wipe any previous session before starting a new one so stale tokens
    // from a different role never bleed into the incoming session.
    removeToken()
    removeUser()
    document.cookie = "demo_role=; path=/; max-age=0; SameSite=Lax"
    setUserState(null)

    const { data } = await api.post("/api/auth/login", { email, password })
    const { user: apiUser, accessToken } = data.data

    const expectedRole = role.toUpperCase() as "STUDENT" | "TEACHER"
    if (apiUser.role !== expectedRole) {
      throw new Error(`This account is not a ${role} account.`)
    }

    setToken(accessToken)
    setUser(apiUser)
    setUserState(apiUser)

    document.cookie = `demo_role=${role}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

    router.push(role === "student" ? "/student/dashboard" : "/teacher/dashboard")
    router.refresh()
  }

  function logout() {
    const path = window.location.pathname
    removeToken()
    removeUser()
    document.cookie = "demo_role=; path=/; max-age=0; SameSite=Lax"
    setUserState(null)
    router.push(path.startsWith("/teacher") ? "/auth/login/teacher" : "/auth/login/student")
  }

  async function refreshUser() {
    try {
      const { data } = await api.get("/api/auth/me")
      const updated = data.data.user as AuthUser
      setUser(updated)
      setUserState(updated)
    } catch {
      // silently fail
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
