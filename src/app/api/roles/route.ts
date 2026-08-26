import { NextResponse } from "next/server";
import { db } from "@/lib/mock-db/store";

export async function GET() {
  return NextResponse.json(db.roles.getAll());
}
