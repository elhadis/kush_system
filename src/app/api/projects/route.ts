import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";
import type { Project } from "@/lib/types";

export async function GET() {
  return NextResponse.json(db.projects.getAll());
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Omit<
      Project,
      "id" | "createdAt" | "updatedAt"
    >;
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const project = db.projects.create({
      name: body.name,
      description: body.description ?? "",
      status: body.status ?? "planning",
      budget: body.budget ?? 0,
      spent: body.spent ?? 0,
      donorIds: body.donorIds ?? [],
      branchId: body.branchId,
      startDate: body.startDate ?? new Date().toISOString().split("T")[0],
      endDate: body.endDate,
    });
    return NextResponse.json(project, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
