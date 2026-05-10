import { NextResponse } from "next/server"
import { mockTeacherCourses } from "@/lib/mock-data"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const course = mockTeacherCourses.find((c) => c.id === id)
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(course)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  const course = mockTeacherCourses.find((c) => c.id === id)
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ ...course, ...body })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const exists = mockTeacherCourses.some((c) => c.id === id)
  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
