import { NextRequest, NextResponse } from "next/server";
import { ResumeRepository } from "@/repositories/resume.repository";
import { db } from "@/db";
import { resumeVersions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.resumeJson) {
      return NextResponse.json({ error: "Missing resumeJson payload" }, { status: 400 });
    }

    const updated = await ResumeRepository.updateJson(id, body.resumeJson);
    if (!updated) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Auto-create a version snapshot if it's the first version or 1 minute has passed since the last one
    try {
      const lastVersion = await db
        .select()
        .from(resumeVersions)
        .where(eq(resumeVersions.resumeId, id))
        .orderBy(desc(resumeVersions.createdAt))
        .limit(1)
        .then((r) => r[0]);

      const shouldCreateVersion =
        !lastVersion ||
        (JSON.stringify(lastVersion.resumeJson) !== JSON.stringify(body.resumeJson) &&
          Date.now() - new Date(lastVersion.createdAt).getTime() > 60000);

      if (shouldCreateVersion) {
        await db.insert(resumeVersions).values({
          resumeId: id,
          versionName: `Auto-saved - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          resumeJson: body.resumeJson,
        });
      }
    } catch (verErr) {
      console.error("Auto-version creation error:", verErr);
    }

    return NextResponse.json({ success: true, updatedAt: updated.updatedAt });
  } catch (error) {
    console.error("Autosave API error:", error);
    return NextResponse.json({ error: "Failed to autosave resume" }, { status: 500 });
  }
}
