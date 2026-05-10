import { NextResponse } from "next/server"
import { mockTransactions } from "@/lib/mock-data"

export async function GET() {
  return NextResponse.json(mockTransactions)
}
