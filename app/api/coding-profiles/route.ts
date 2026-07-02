import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { codingProfiles } from "@/db/schema";
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

    const profiles = await db
      .select()
      .from(codingProfiles)
      .where(eq(codingProfiles.userId, userId));

    return NextResponse.json(profiles);
  } catch (error: any) {
    console.error("GET Coding Profiles API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch coding profiles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { provider, url, username } = body;

    if (!provider || !url) {
      return NextResponse.json({ error: "Provider and URL are required" }, { status: 400 });
    }

    // Check if profile already exists for this provider
    const existing = await db
      .select()
      .from(codingProfiles)
      .where(
        and(
          eq(codingProfiles.userId, userId),
          eq(codingProfiles.provider, provider)
        )
      );

    if (existing.length > 0) {
      // Update existing profile
      const [updated] = await db
        .update(codingProfiles)
        .set({
          url,
          username: username || null,
          status: "connected",
          updatedAt: new Date(),
        })
        .where(eq(codingProfiles.id, existing[0].id))
        .returning();

      return NextResponse.json(updated);
    } else {
      // Create new profile connection
      const [inserted] = await db
        .insert(codingProfiles)
        .values({
          userId,
          provider,
          url,
          username: username || null,
          status: "connected",
        })
        .returning();

      return NextResponse.json(inserted);
    }
  } catch (error: any) {
    console.error("POST Coding Profiles API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to handle coding profile" }, { status: 500 });
  }
}
