import { NextRequest, NextResponse } from "next/server";
import { db, enrichActivity } from "@/lib/mock-db/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const activity = db.activities.getById(id);
  if (!activity) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }
  return NextResponse.json(enrichActivity(activity));
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = db.activities.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Activity not found" }, { status: 404 });
    }
    return NextResponse.json(enrichActivity(updated));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const deleted = db.activities.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Activity not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
