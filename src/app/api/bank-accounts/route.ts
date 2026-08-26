import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";
import type { Bank } from "@/lib/types";

export async function GET(request: NextRequest) {
  const branchId = request.nextUrl.searchParams.get("branchId");
  let banks = db.banks.getAll();
  if (branchId) {
    banks = banks.filter((b) => b.branchId === branchId);
  }
  return NextResponse.json(banks);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<
      Bank,
      "id" | "createdAt" | "updatedAt" | "name"
    > & { name?: string };

    if (!body.accountNumber || !body.branchId || !body.currencyId) {
      return NextResponse.json(
        { error: "Account number, branch, and currency are required" },
        { status: 400 }
      );
    }

    if (!body.bankName && !body.accountName && !body.name) {
      return NextResponse.json(
        { error: "Bank name or account name is required" },
        { status: 400 }
      );
    }

    const bank = db.banks.create({
      bankName: body.bankName ?? body.name ?? "",
      accountName: body.accountName ?? body.name ?? "",
      accountNumber: body.accountNumber,
      balance: body.balance ?? 0,
      currencyId: body.currencyId,
      branchId: body.branchId,
    });

    return NextResponse.json(bank, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
