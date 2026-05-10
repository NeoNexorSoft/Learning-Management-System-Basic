import axios from "axios"
import { getToken, removeToken, removeUser } from "./auth"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
})

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token      = getToken()
    const adminToken = localStorage.getItem("admin_token")
    const bearer     = token || adminToken
    if (bearer) config.headers.Authorization = `Bearer ${bearer}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      const isAdmin = !!localStorage.getItem("admin_token")
      if (isAdmin) {
        localStorage.removeItem("admin_token")
        localStorage.removeItem("admin_user")
        document.cookie = "admin_role=; path=/; max-age=0; SameSite=Lax"
        window.location.href = "/admin/login"
      } else {
        removeToken()
        removeUser()
        document.cookie = "demo_role=; path=/; max-age=0; SameSite=Lax"
        const path = window.location.pathname
        window.location.href = path.startsWith("/teacher")
          ? "/auth/login/teacher"
          : "/auth/login/student"
      }
    }
    return Promise.reject(err)
  },
)

export default api
