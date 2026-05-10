import { NextResponse } from "next/server"
import { mockTeacherCourses } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockTeacherCourses)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newCourse = { id: String(Date.now()), totalStudents: 0, totalEarnings: 0, rating: 0, totalReviews: 0, ...body }
  return NextResponse.json(newCourse, { status: 201 })
}
