import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  const role      = request.cookies.get("demo_role")?.value  as "student" | "teacher" | undefined
  const adminRole = request.cookies.get("admin_role")?.value as "admin"   | undefined
  const { pathname } = request.nextUrl

  if (pathname === "/admin/login") {
    if (adminRole === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith("/admin")) {
    if (adminRole !== "admin") return NextResponse.redirect(new URL("/admin/login", request.url))
    return NextResponse.next()
  }

  if (pathname.startsWith("/auth")) {
    if (role) {
      const pathRole = pathname.includes("/teacher") ? "teacher"
          : pathname.includes("/student")  ? "student"
              : null

      if (pathRole === null || pathRole === role) {
        const dest = role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
        return NextResponse.redirect(new URL(dest, request.url))
      }

      const response = NextResponse.next()
      response.cookies.set("demo_role", "", { path: "/", maxAge: 0, sameSite: "lax" })
      return response
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/student")) {
    if (!role) return NextResponse.redirect(new URL("/auth/login/student", request.url))
    if (role !== "student") return NextResponse.redirect(new URL("/unauthorized", request.url))
    return NextResponse.next()
  }

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