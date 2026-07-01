import { db } from "@/db"
import { corporateJobs, governmentJobs } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export interface CorporateJobInput {
  title: string
  company: string
  location?: string | null
  type?: string | null
  salary?: string | null
  postedDate?: Date | null
  deadline?: Date | null
  description?: string | null
  requirements?: string[] | null
  status?: string | null
}

export interface GovernmentJobInput {
  title: string
  department: string
  eligibility?: string | null
  location?: string | null
  lastDate?: Date | null
  applyLink?: string | null
  vacancies?: number | null
}

export class JobRepository {
  // Corporate Jobs
  static async findCorporateById(id: string) {
    const result = await db.select().from(corporateJobs).where(eq(corporateJobs.id, id))
    return result[0] || null
  }

  static async findAllCorporate() {
    return await db.select().from(corporateJobs).orderBy(desc(corporateJobs.createdAt))
  }

  static async createCorporate(data: CorporateJobInput) {
    const result = await db.insert(corporateJobs).values({
      ...data,
      requirements: data.requirements || [],
      postedDate: data.postedDate || new Date(),
    }).returning()
    return result[0]
  }

  // Government Jobs
  static async findGovtById(id: string) {
    const result = await db.select().from(governmentJobs).where(eq(governmentJobs.id, id))
    return result[0] || null
  }

  static async findAllGovt() {
    return await db.select().from(governmentJobs).orderBy(desc(governmentJobs.createdAt))
  }

  static async createGovt(data: GovernmentJobInput) {
    const result = await db.insert(governmentJobs).values(data).returning()
    return result[0]
  }
}
