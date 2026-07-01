import { db } from "@/db"
import { applications } from "@/db/schema"
import { eq, desc, and, isNull } from "drizzle-orm"

export interface ApplicationInput {
  userId?: string | null
  company: string
  role: string
  status: string
  appliedDate: Date
  deadline?: Date | null
  location?: string | null
  salary?: string | null
  notes?: string | null
}

export class ApplicationRepository {
  static async findById(id: string) {
    const result = await db
      .select()
      .from(applications)
      .where(and(eq(applications.id, id), isNull(applications.deletedAt)))
    return result[0] || null
  }

  static async findByUserId(userId: string) {
    return await db
      .select()
      .from(applications)
      .where(and(eq(applications.userId, userId), isNull(applications.deletedAt)))
      .orderBy(desc(applications.appliedDate))
  }

  static async findAll() {
    return await db
      .select()
      .from(applications)
      .where(isNull(applications.deletedAt))
      .orderBy(desc(applications.appliedDate))
  }

  static async create(data: ApplicationInput) {
    const result = await db
      .insert(applications)
      .values({
        ...data,
      })
      .returning()
    return result[0]
  }

  static async update(id: string, data: Partial<ApplicationInput>) {
    const result = await db
      .update(applications)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning()
    return result[0] || null
  }

  static async delete(id: string) {
    const result = await db
      .update(applications)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(applications.id, id))
      .returning()
    return result[0] || null
  }
}
