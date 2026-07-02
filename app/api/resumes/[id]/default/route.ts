import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { resumes } from "@/db/schema";
import { ResumeRepository } from "@/repositories/resume.repository";
import { eq, and, isNull } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const resume = await ResumeRepository.findById(id);
    
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    const currentDefaultState = resume.isDefault || false;

    if (!currentDefaultState) {
      // User is trying to set this resume as default. Check limit of max 5 default resumes.
      const defaultResumes = await db
        .select()
        .from(resumes)
        .where(
          and(
            eq(resumes.userId, resume.userId),
            eq(resumes.isDefault, true),
            isNull(resumes.deletedAt)
          )
        );

      if (defaultResumes.length >= 5) {
        return NextResponse.json(
          { error: "You can mark a maximum of 5 resumes as default." },
          { status: 400 }
        );
      }
    }

    // Toggle default status
    const updated = await ResumeRepository.update(id, {
      isDefault: !currentDefaultState,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Toggle default API error:", error);
    return NextResponse.json({ error: "Failed to toggle default status" }, { status: 500 });
  }
}
