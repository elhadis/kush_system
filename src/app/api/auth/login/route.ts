import { NextRequest, NextResponse } from "next/server";
import {
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_PASSWORD,
  sanitizeUser,
  verifyPassword,
} from "@/lib/auth/password";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/session";
import { db } from "@/lib/mock-db/store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.info("[auth/login] Attempt:", email);

    // Hardcoded Super Admin (always accepted)
    const isHardcodedAdmin =
      email === SUPER_ADMIN_EMAIL.toLowerCase() &&
      password === SUPER_ADMIN_PASSWORD;

    const user = db.users.getByEmail(email);

    if (!user || !user.isActive) {
      console.info("[auth/login] Failed — user not found or inactive:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const passwordOk =
      isHardcodedAdmin || verifyPassword(password, user.passwordHash);

    if (!passwordOk) {
      console.info("[auth/login] Failed — bad password:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      user: sanitizeUser(user),
      mustChangePasswordOnFirstLogin: Boolean(
        user.mustChangePasswordOnFirstLogin
      ),
    });

    response.cookies.set(SESSION_COOKIE, user.id, sessionCookieOptions());
    console.info("[auth/login] Success:", user.email, user.id);
    return response;
  } catch (error) {
    console.error("[auth/login] Error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 400 });
  }
}
