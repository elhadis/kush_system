import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const donor = db.donors.getById(id);
  if (!donor) {
    return NextResponse.json({ error: "Donor not found" }, { status: 404 });
  }
  return NextResponse.json(donor);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = db.donors.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Donor not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const deleted = db.donors.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Donor not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
