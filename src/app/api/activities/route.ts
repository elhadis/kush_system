import { NextRequest, NextResponse } from "next/server";
import { db, enrichActivity } from "@/lib/mock-db/store";
import type { Activity } from "@/lib/types";

export async function GET(request: NextRequest) {
  const branchId = request.nextUrl.searchParams.get("branchId");
  const bankAccountId = request.nextUrl.searchParams.get("bankAccountId");

  let activities = db.activities.getAll();

  if (branchId) {
    activities = activities.filter((a) => a.branchId === branchId);
  }
  if (bankAccountId) {
    activities = activities.filter((a) => a.bankAccountId === bankAccountId);
  }

  return NextResponse.json(activities.map(enrichActivity));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<
      Activity,
      "id" | "createdAt" | "updatedAt"
    >;

    if (
      !body.title ||
      !body.status ||
      !body.branchId ||
      !body.bankAccountId ||
      !body.currencyId
    ) {
      return NextResponse.json(
        {
          error:
            "Title, status, branch, bank account, and currency are required",
        },
        { status: 400 }
      );
    }

    const activity = db.activities.create({
      title: body.title,
      description: body.description,
      status: body.status,
      cost: body.cost ?? 0,
      branchId: body.branchId,
      bankAccountId: body.bankAccountId,
      currencyId: body.currencyId,
      projectId: body.projectId,
      date: body.date,
    });

    return NextResponse.json(enrichActivity(activity), { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid request body";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
