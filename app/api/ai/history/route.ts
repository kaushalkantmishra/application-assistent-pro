import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { aiResumeReports, atsReports, careerRoadmaps, coverLetterHistory } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
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

    const [resumeReports, standaloneAts, roadmaps, letters] = await Promise.all([
      db
        .select()
        .from(aiResumeReports)
        .where(eq(aiResumeReports.userId, userId))
        .orderBy(desc(aiResumeReports.createdAt))
        .limit(10),
      db
        .select()
        .from(atsReports)
        .where(eq(atsReports.userId, userId))
        .orderBy(desc(atsReports.createdAt))
        .limit(10),
      db
        .select()
        .from(careerRoadmaps)
        .where(eq(careerRoadmaps.userId, userId))
        .orderBy(desc(careerRoadmaps.createdAt))
        .limit(5),
      db
        .select()
        .from(coverLetterHistory)
        .where(eq(coverLetterHistory.userId, userId))
        .orderBy(desc(coverLetterHistory.createdAt))
        .limit(5),
    ]);

    return NextResponse.json({
      resumeReports,
      standaloneAts,
      roadmaps,
      coverLetters: letters,
    });
  } catch (error: any) {
    console.error("GET AI History logs Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch AI activity history" }, { status: 550 });
  }
}
