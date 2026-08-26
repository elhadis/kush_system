import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const includeRelations = request.nextUrl.searchParams.get("include") === "relations";

  if (includeRelations) {
    const branch = db.branches.getWithRelations(id);
    if (!branch) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    return NextResponse.json(branch);
  }

  const branch = db.branches.getById(id);
  if (!branch) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }
  return NextResponse.json(branch);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = db.branches.update(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Branch not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const deleted = db.branches.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Branch not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
