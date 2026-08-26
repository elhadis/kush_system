import { NextRequest, NextResponse } from "next/server";
import { resolveAppUrl } from "@/lib/app-url";
import { hashPassword, sanitizeUser } from "@/lib/auth/password";
import { sendWelcomeEmail } from "@/lib/email/welcome";
import { db } from "@/lib/mock-db/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(db.users.getAll().map(sanitizeUser));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.roleId) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      );
    }

    if (!body.password || typeof body.password !== "string") {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (body.password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existing = db.users
      .getAll()
      .find((u) => u.email.toLowerCase() === String(body.email).toLowerCase());
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists" },
        { status: 400 }
      );
    }

    console.info("[api/users] Creating user:", body.email);

    const user = db.users.create({
      name: body.name,
      email: body.email,
      roleId: body.roleId,
      branchId: body.branchId || undefined,
      isActive: body.isActive ?? true,
      avatar: body.avatar,
      passwordHash: hashPassword(body.password),
      mustChangePasswordOnFirstLogin: true,
    });

    const loginUrl = `${resolveAppUrl(request)}/login`;

    console.info("[api/users] Awaiting welcome email for:", user.email);

    const emailResult = await sendWelcomeEmail({
      name: user.name,
      email: user.email,
      password: body.password,
      loginUrl,
    });

    console.info("[api/users] Welcome email result:", emailResult);

    if (!emailResult.sent) {
      return NextResponse.json(
        {
          error:
            emailResult.message ??
            "User was created but the welcome email failed to send",
          user: sanitizeUser(user),
          email: emailResult,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        user: sanitizeUser(user),
        email: emailResult,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[api/users] POST failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid request body",
      },
      { status: 400 }
    );
  }
}
