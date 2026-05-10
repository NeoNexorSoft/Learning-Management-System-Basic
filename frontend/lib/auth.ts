const AUTH_TOKEN_KEY = "auth_token"
const AUTH_USER_KEY  = "auth_user"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "STUDENT" | "TEACHER" | "ADMIN"
  avatar?: string | null
  username?: string
  bio?: string | null
  mobile?: string | null
  balance?: number
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function setUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function removeUser(): void {
  localStorage.removeItem(AUTH_USER_KEY)
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function getUserRole(): string | null {
  return getUser()?.role ?? null
}
