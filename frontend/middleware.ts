import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const role      = request.cookies.get("demo_role")?.value  as "student" | "teacher" | undefined
  const adminRole = request.cookies.get("admin_role")?.value as "admin" | undefined
  const { pathname } = request.nextUrl

  // /admin/login → redirect to dashboard if already logged in as admin
  if (pathname === "/admin/login") {
    if (adminRole === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    return NextResponse.next()
  }

  // /admin/* → requires admin_role cookie
  if (pathname.startsWith("/admin")) {
    if (adminRole !== "admin") return NextResponse.redirect(new URL("/admin/login", request.url))
    return NextResponse.next()
  }

  // /auth/* → only redirect to dashboard when the cookie role matches the requested role.
  // If a user with demo_role=student navigates to /auth/login/teacher, clear the stale
  // cookie and let them through — this is the root cause of the role session bleed.
  if (pathname.startsWith("/auth")) {
    if (role) {
      const pathRole = pathname.includes("/teacher") ? "teacher"
                     : pathname.includes("/student")  ? "student"
                     : null

      if (pathRole === null || pathRole === role) {
        const dest = role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
        return NextResponse.redirect(new URL(dest, request.url))
      }

      // Role switch — clear the stale cookie and let the user reach the new login page
      const response = NextResponse.next()
      response.cookies.set("demo_role", "", { path: "/", maxAge: 0, sameSite: "lax" })
      return response
    }
    return NextResponse.next()
  }

  // /student/* → requires student role; wrong role → /unauthorized (not another panel)
  if (pathname.startsWith("/student")) {
    if (!role) return NextResponse.redirect(new URL("/auth/login/student", request.url))
    if (role !== "student") return NextResponse.redirect(new URL("/unauthorized", request.url))
    return NextResponse.next()
  }

  // /teacher/* → requires teacher role; wrong role → /unauthorized
  if (pathname.startsWith("/teacher")) {
    if (!role) return NextResponse.redirect(new URL("/auth/login/teacher", request.url))
    if (role !== "teacher") return NextResponse.redirect(new URL("/unauthorized", request.url))
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/auth/:path*"],
}
