import { NextResponse } from "next/server"
import { mockEnrollments } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockEnrollments)
}
