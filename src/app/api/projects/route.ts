import { NextRequest, NextResponse } from "next/server";
import { db, enrichProject } from "@/lib/mock-db/store";

export async function GET(request: NextRequest) {
  try {
    const branchId = request.nextUrl.searchParams.get("branchId");
    let projects = db.projects.getAll();
    if (branchId) {
      projects = projects.filter((p) => p.branchId === branchId);
    }
    return NextResponse.json(projects.map(enrichProject));
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title && !body.name) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!body.branchId || !body.currencyId) {
      return NextResponse.json(
        { error: "Branch and currency are required" },
        { status: 400 }
      );
    }

    const project = db.projects.create({
      title: body.title ?? body.name,
      description: body.description ?? "",
      status: body.status ?? "planning",
      targetBudget: body.targetBudget ?? body.budget ?? 0,
      collectedAmount: body.collectedAmount ?? body.spent ?? 0,
      donorIds: body.donorIds ?? [],
      branchId: body.branchId,
      currencyId: body.currencyId,
      startDate: body.startDate ?? new Date().toISOString().split("T")[0],
      endDate: body.endDate,
    });

    return NextResponse.json(enrichProject(project), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
