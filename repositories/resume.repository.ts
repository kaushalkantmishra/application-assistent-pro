import { db } from "@/db"
import { resumes } from "@/db/schema"
import { eq, and, or, like, isNull, desc, asc, sql } from "drizzle-orm"

export interface ResumeInput {
  title: string
  templateId?: string
  themeId?: string
  resumeJson: Record<string, any>
  status?: string
}

export class ResumeRepository {
  static async findById(id: string) {
    const result = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, id), isNull(resumes.deletedAt)))
    return result[0] || null
  }

  static async findAll(
    userId: string,
    options: {
      search?: string
      isFavorite?: boolean
      templateId?: string
      sortBy?: "updatedAt" | "title" | "createdAt"
      sortOrder?: "asc" | "desc"
    } = {}
  ) {
    const { search, isFavorite, templateId, sortBy = "updatedAt", sortOrder = "desc" } = options

    const conditions = [eq(resumes.userId, userId), isNull(resumes.deletedAt)]

    if (isFavorite !== undefined) {
      conditions.push(eq(resumes.isFavorite, isFavorite))
    }

    if (templateId && templateId !== "all") {
      conditions.push(eq(resumes.templateId, templateId))
    }

    if (search) {
      const searchOr = or(
        like(resumes.title, `%${search}%`),
        sql`${resumes.resumeJson}->'personalInfo'->>'fullName' ILIKE ${`%${search}%`}`,
        sql`exists (
          select 1 from jsonb_array_elements(${resumes.resumeJson}->'technicalSkills'->'items') as skill
          where skill->>'skills' ILIKE ${`%${search}%`} or skill->>'category' ILIKE ${`%${search}%`}
        )`,
        sql`exists (
          select 1 from jsonb_array_elements(${resumes.resumeJson}->'experience'->'items') as exp
          where exp->>'company' ILIKE ${`%${search}%`} or exp->>'role' ILIKE ${`%${search}%`}
        )`
      )
      if (searchOr) {
        conditions.push(searchOr)
      }
    }

    let order = desc(resumes.updatedAt)
    if (sortBy === "title") {
      order = sortOrder === "asc" ? asc(resumes.title) : desc(resumes.title)
    } else if (sortBy === "createdAt") {
      order = sortOrder === "asc" ? asc(resumes.createdAt) : desc(resumes.createdAt)
    } else if (sortBy === "updatedAt") {
      order = sortOrder === "asc" ? asc(resumes.updatedAt) : desc(resumes.updatedAt)
    }

    return await db
      .select()
      .from(resumes)
      .where(and(...conditions))
      .orderBy(order)
  }

  static async create(userId: string, data: ResumeInput) {
    const result = await db
      .insert(resumes)
      .values({
        userId,
        title: data.title,
        templateId: data.templateId || "modern",
        themeId: data.themeId || "default",
        resumeJson: data.resumeJson,
        status: data.status || "draft",
        isFavorite: false,
        isDefault: false,
      })
      .returning()
    return result[0]
  }

  static async update(
    id: string,
    data: Partial<Omit<ResumeInput, "resumeJson">> & { isFavorite?: boolean; isDefault?: boolean }
  ) {
    const result = await db
      .update(resumes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning()
    return result[0] || null
  }

  static async updateJson(id: string, resumeJson: Record<string, any>) {
    const result = await db
      .update(resumes)
      .set({
        resumeJson,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning()
    return result[0] || null
  }

  static async duplicate(id: string) {
    const original = await this.findById(id)
    if (!original) return null

    const result = await db
      .insert(resumes)
      .values({
        userId: original.userId,
        title: `${original.title} (Copy)`,
        templateId: original.templateId,
        themeId: original.themeId,
        resumeJson: original.resumeJson,
        status: original.status,
        isFavorite: false,
      })
      .returning()
    return result[0]
  }

  static async toggleFavorite(id: string) {
    const original = await this.findById(id)
    if (!original) return null

    const result = await db
      .update(resumes)
      .set({
        isFavorite: !original.isFavorite,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning()
    return result[0] || null
  }

  static async rename(id: string, title: string) {
    const result = await db
      .update(resumes)
      .set({
        title,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning()
    return result[0] || null
  }

  static async delete(id: string) {
    const result = await db
      .update(resumes)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(resumes.id, id))
      .returning()
    return result[0] || null
  }
}
