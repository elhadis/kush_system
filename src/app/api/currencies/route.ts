import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";
import type { Currency } from "@/lib/types";

export async function GET() {
  return NextResponse.json(db.currencies.getAll());
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<Currency, "id" | "updatedAt">;

    if (!body.code || !body.name || body.exchangeRate == null) {
      return NextResponse.json(
        { error: "Code, name, and exchange rate are required" },
        { status: 400 }
      );
    }

    const existing = db.currencies.getByCode(body.code.toUpperCase());
    if (existing) {
      return NextResponse.json(
        { error: "Currency code already exists" },
        { status: 400 }
      );
    }

    const currency = db.currencies.create({
      code: body.code.toUpperCase(),
      name: body.name,
      exchangeRate: body.exchangeRate,
    });

    return NextResponse.json(currency, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
