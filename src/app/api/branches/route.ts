import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";
import type { Branch } from "@/lib/types";

export async function GET(request: NextRequest) {
  const includeRelations = request.nextUrl.searchParams.get("include") === "relations";

  if (includeRelations) {
    const branches = db.branches.getAll().map((branch) => {
      const withRelations = db.branches.getWithRelations(branch.id);
      return withRelations ?? branch;
    });
    return NextResponse.json(branches);
  }

  return NextResponse.json(db.branches.getAll());
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<
      Branch,
      "id" | "createdAt" | "updatedAt"
    >;

    if (!body.name || !body.location) {
      return NextResponse.json(
        { error: "Name and location are required" },
        { status: 400 }
      );
    }

    const branch = db.branches.create({
      name: body.name,
      location: body.location,
      city: body.city ?? "",
      address: body.address ?? "",
      phone: body.phone ?? "",
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(branch, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
