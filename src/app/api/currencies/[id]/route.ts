import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const currency = db.currencies.getById(id);
  if (!currency) {
    return NextResponse.json({ error: "Currency not found" }, { status: 404 });
  }
  return NextResponse.json(currency);
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  try {
    const body = await request.json();
    const updated = db.currencies.update(id, {
      name: body.name,
      exchangeRate: body.exchangeRate,
      code: body.code?.toUpperCase(),
    });
    if (!updated) {
      return NextResponse.json({ error: "Currency not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const deleted = db.currencies.delete(id);
  if (!deleted) {
    return NextResponse.json({ error: "Currency not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
