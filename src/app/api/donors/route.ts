import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";
import type { Donor } from "@/lib/types";

export async function GET() {
  return NextResponse.json(db.donors.getAll());
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<
      Donor,
      "id" | "createdAt" | "updatedAt"
    >;
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }
    const donor = db.donors.create({
      name: body.name,
      email: body.email,
      phone: body.phone ?? "",
      type: body.type ?? "individual",
      totalDonated: body.totalDonated ?? 0,
      projectIds: body.projectIds ?? [],
    });
    return NextResponse.json(donor, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
