import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { jobDescriptionLibrary } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { eq, and, desc } from "drizzle-orm";

async function getUserIdOrFallback() {
  const session = await auth();
  let userId = session?.user?.id;
  if (!userId) {
    let testUser = await UserRepository.findByEmail("test@example.com");
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test@example.com",
        name: "Test User",
        role: "job_seeker",
      });
    }
    userId = testUser.id;
  }
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const list = await db
      .select()
      .from(jobDescriptionLibrary)
      .where(eq(jobDescriptionLibrary.userId, userId))
      .orderBy(desc(jobDescriptionLibrary.createdAt));

    return NextResponse.json(list);
  } catch (error: any) {
    console.error("GET JD Library Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch library" }, { status: 550 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { title, company, descriptionText } = body;

    if (!title || !company || !descriptionText) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [inserted] = await db
      .insert(jobDescriptionLibrary)
      .values({
        userId,
        title,
        company,
        descriptionText,
        isFavorite: false,
      })
      .returning();

    return NextResponse.json(inserted);
  } catch (error: any) {
    console.error("POST JD Library Error:", error);
    return NextResponse.json({ error: error.message || "Failed to save job description" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { id, isFavorite } = body;

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(jobDescriptionLibrary)
      .set({ isFavorite })
      .where(and(eq(jobDescriptionLibrary.id, id), eq(jobDescriptionLibrary.userId, userId)))
      .returning();

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("PUT JD Library Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update favorite status" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    await db
      .delete(jobDescriptionLibrary)
      .where(and(eq(jobDescriptionLibrary.id, id), eq(jobDescriptionLibrary.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE JD Library Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete item" }, { status: 500 });
  }
}
