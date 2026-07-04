import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRepository } from "@/repositories/user.repository";
import { ResumeRepository } from "@/repositories/resume.repository";
import { getInitialResumeJson } from "@/lib/resume-schemas";
import { db } from "@/db";
import { resumeFolderMappings, resumeTagMappings, resumeFolders, resumeTags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const CreateResumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  templateId: z.string().default("classic"),
  themeId: z.string().default("default"),
});

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
    
    const search = searchParams.get("search") || undefined;
    const isFavorite = searchParams.get("isFavorite") === "true" ? true : undefined;
    const templateId = searchParams.get("templateId") || undefined;
    const sortBy = (searchParams.get("sortBy") as "updatedAt" | "title" | "createdAt") || undefined;
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc") || undefined;

    const list = await ResumeRepository.findAll(userId, {
      search,
      isFavorite,
      templateId,
      sortBy,
      sortOrder,
    });

    // Enriched folder and tag metadata
    const foldersMap = await db.select().from(resumeFolderMappings);
    const tagsMap = await db.select().from(resumeTagMappings);
    const userFolders = await db.select().from(resumeFolders).where(eq(resumeFolders.userId, userId));
    const userTags = await db.select().from(resumeTags).where(eq(resumeTags.userId, userId));

    const enrichedList = list.map((res) => {
      const folderMapping = foldersMap.find((m) => m.resumeId === res.id);
      const folder = folderMapping ? userFolders.find((f) => f.id === folderMapping.folderId) : null;

      const matchedTagMappings = tagsMap.filter((m) => m.resumeId === res.id);
      const tags = matchedTagMappings
        .map((m) => userTags.find((t) => t.id === m.tagId))
        .filter(Boolean);

      return {
        ...res,
        folder,
        tags,
      };
    });

    return NextResponse.json(enrichedList);
  } catch (error) {
    console.error("List resumes API error:", error);
    return NextResponse.json({ error: "Failed to fetch resumes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    
    const parsed = CreateResumeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const initialJson = getInitialResumeJson();
    const session = await auth();
    if (session?.user) {
      initialJson.personalInfo.fullName = session.user.name || "";
      initialJson.personalInfo.email = session.user.email || "";
    } else {
      initialJson.personalInfo.fullName = "Test User";
      initialJson.personalInfo.email = "test@example.com";
    }

    const newResume = await ResumeRepository.create(userId, {
      title: parsed.data.title,
      templateId: parsed.data.templateId,
      themeId: parsed.data.themeId,
      resumeJson: initialJson,
      status: "draft",
    });

    return NextResponse.json(newResume, { status: 201 });
  } catch (error) {
    console.error("Create resume API error:", error);
    return NextResponse.json({ error: "Failed to create resume" }, { status: 500 });
  }
}
