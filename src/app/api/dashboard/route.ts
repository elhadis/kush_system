import { NextRequest, NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/mock-db/store";

export async function GET(request: NextRequest) {
  const branchId = request.nextUrl.searchParams.get("branchId");
  const stats = getDashboardStats(branchId);
  return NextResponse.json(stats);
}
