import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { careerRoadmaps } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { CareerAssistantService } from "@/services/ai/career-assistant";
import { eq, desc } from "drizzle-orm";

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
    const roadmaps = await db
      .select()
      .from(careerRoadmaps)
      .where(eq(careerRoadmaps.userId, userId))
      .orderBy(desc(careerRoadmaps.createdAt));

    return NextResponse.json(roadmaps);
  } catch (error: any) {
    console.error("GET Career Roadmaps Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch roadmaps" }, { status: 550 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { targetRole, currentSkills, experienceText, jobDescription } = body;

    if (!targetRole || !currentSkills) {
      return NextResponse.json({ error: "Target role and current skills are required" }, { status: 400 });
    }

    const roadmapData = await CareerAssistantService.generateRoadmap(
      currentSkills,
      targetRole,
      experienceText || "Software developer candidate",
      jobDescription
    );

    const [inserted] = await db
      .insert(careerRoadmaps)
      .values({
        userId,
        targetRole,
        roadmapJson: roadmapData,
      })
      .returning();

    return NextResponse.json(inserted);
  } catch (error: any) {
    console.error("POST Career Roadmap Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate career roadmap" }, { status: 500 });
  }
}
