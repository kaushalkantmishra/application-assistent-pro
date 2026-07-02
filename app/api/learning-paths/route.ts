import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { learningPaths } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const paths = await db
      .select()
      .from(learningPaths)
      .orderBy(desc(learningPaths.createdAt));

    return NextResponse.json(paths);
  } catch (error: any) {
    console.error("GET Learning Paths API Error:", error);
    return NextResponse.json({ error: "Failed to fetch learning paths" }, { status: 500 });
  }
}
