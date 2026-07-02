import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { resumeFolders, coverLetterFolders } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { eq, and } from "drizzle-orm";

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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "resume"; // 'resume' or 'cover-letter'

    if (type === "cover-letter") {
      const folders = await db
        .select()
        .from(coverLetterFolders)
        .where(eq(coverLetterFolders.userId, userId));
      return NextResponse.json(folders);
    } else {
      const folders = await db
        .select()
        .from(resumeFolders)
        .where(eq(resumeFolders.userId, userId));
      return NextResponse.json(folders);
    }
  } catch (error: any) {
    console.error("GET Folders Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch folders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { name, type } = body; // type is 'resume' or 'cover-letter'

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
    }

    if (type === "cover-letter") {
      const [inserted] = await db
        .insert(coverLetterFolders)
        .values({
          userId,
          name: name.trim(),
        })
        .returning();
      return NextResponse.json(inserted, { status: 201 });
    } else {
      const [inserted] = await db
        .insert(resumeFolders)
        .values({
          userId,
          name: name.trim(),
        })
        .returning();
      return NextResponse.json(inserted, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST Folder Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create folder" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "resume";

    if (!id) {
      return NextResponse.json({ error: "Folder ID is required" }, { status: 400 });
    }

    if (type === "cover-letter") {
      await db
        .delete(coverLetterFolders)
        .where(and(eq(coverLetterFolders.id, id), eq(coverLetterFolders.userId, userId)));
      return NextResponse.json({ success: true });
    } else {
      await db
        .delete(resumeFolders)
        .where(and(eq(resumeFolders.id, id), eq(resumeFolders.userId, userId)));
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    console.error("DELETE Folder Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete folder" }, { status: 500 });
  }
}
