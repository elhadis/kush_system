import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";
import type { Bank } from "@/lib/types";

export async function GET() {
  return NextResponse.json(db.banks.getAll());
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<
      Bank,
      "id" | "createdAt" | "updatedAt"
    >;
    if (!body.name || !body.accountNumber) {
      return NextResponse.json(
        { error: "Name and account number are required" },
        { status: 400 }
      );
    }
    const bank = db.banks.create({
      name: body.name,
      accountNumber: body.accountNumber,
      balance: body.balance ?? 0,
      currency: body.currency ?? "USD",
      branchId: body.branchId,
    });
    return NextResponse.json(bank, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
