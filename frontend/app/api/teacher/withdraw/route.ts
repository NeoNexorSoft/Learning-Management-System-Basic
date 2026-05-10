import { NextResponse } from "next/server"
import { mockWithdrawRequests } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockWithdrawRequests)
}

export async function POST(request: Request) {
  const body = await request.json()
  const newRequest = {
    id: String(Date.now()),
    status: "pending",
    requestedAt: new Date().toISOString().split("T")[0],
    processedAt: null,
    ...body,
  }
  return NextResponse.json(newRequest, { status: 201 })
}
