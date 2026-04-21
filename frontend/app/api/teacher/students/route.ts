import { NextResponse } from "next/server"
import { mockTeacherStudents } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockTeacherStudents)
}
