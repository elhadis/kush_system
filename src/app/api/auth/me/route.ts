import { NextRequest, NextResponse } from "next/server";
import { sanitizeUser } from "@/lib/auth/password";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { db } from "@/lib/mock-db/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = db.users.getById(userId);
  if (!user || !user.isActive) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user: sanitizeUser(user) });
}
