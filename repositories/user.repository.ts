import { db } from "@/db"
import { users, userProfiles } from "@/db/schema"
import { eq } from "drizzle-orm"

export interface UserInput {
  name?: string | null
  email: string
  image?: string | null
  role?: string
}

export interface UserProfileInput {
  phone?: string | null
  location?: string | null
  education?: string | null
  experience?: string | null
  skills?: string[] | null
  preferredRoles?: string[] | null
  preferredCompanies?: string[] | null
  preferredLocations?: string[] | null
  resumeFileName?: string | null
  
  about?: string | null
  currentDesignation?: string | null
  yearsOfExperience?: number | null
  currentCompany?: string | null
  currentSalary?: string | null
  expectedSalary?: string | null
  preferredIndustry?: string | null
  preferredWorkMode?: string | null
  languages?: string[] | null

  // Social Links
  github?: string | null
  linkedin?: string | null
  portfolio?: string | null
  leetcode?: string | null
  geeksforgeeks?: string | null
  codechef?: string | null
  codeforces?: string | null
  hackerrank?: string | null
  hackerearth?: string | null
  website?: string | null
}

export class UserRepository {
  static async findById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0] || null
  }

  static async findByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] || null
  }

  static async create(data: UserInput) {
    const result = await db.insert(users).values({
      email: data.email,
      name: data.name || null,
      image: data.image || null,
      role: data.role || "job_seeker",
    }).returning()
    return result[0]
  }

  static async update(id: string, data: Partial<UserInput>) {
    const result = await db.update(users).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(users.id, id)).returning()
    return result[0] || null
  }

  static async getProfileByUserId(userId: string) {
    const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId))
    return result[0] || null
  }

  static async upsertProfile(userId: string, data: UserProfileInput) {
    const existing = await this.getProfileByUserId(userId)
    if (existing) {
      const result = await db.update(userProfiles).set({
        ...data,
        updatedAt: new Date(),
      }).where(eq(userProfiles.userId, userId)).returning()
      return result[0]
    } else {
      const result = await db.insert(userProfiles).values({
        userId,
        ...data,
      }).returning()
      return result[0]
    }
  }
}
