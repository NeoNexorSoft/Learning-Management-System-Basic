import { NextResponse } from "next/server"
import { mockTeacherSettings } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockTeacherSettings)
}

export async function PUT(request: Request) {
  const body = await request.json()
  return NextResponse.json({ ...mockTeacherSettings, ...body })
}
