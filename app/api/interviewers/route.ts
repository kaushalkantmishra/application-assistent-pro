import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { interviewers, users } from "@/db/schema"
import { desc, asc, and, or, like, eq, sql, isNull } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const company = searchParams.get("company") || "all"
    const specialization = searchParams.get("specialization") || "all"
    const interviewType = searchParams.get("interviewType") || "all"
    const pricingType = searchParams.get("pricingType") || "all"
    const language = searchParams.get("language") || "all"
    const category = searchParams.get("category") || "all"
    const sortBy = searchParams.get("sortBy") || "rating"

    let conditions: any[] = [eq(interviewers.isActive, true)]

    if (search) {
      conditions.push(
        or(
          like(interviewers.name, `%${search}%`),
          like(interviewers.company, `%${search}%`),
          like(interviewers.bio, `%${search}%`),
          sql`${interviewers.specializations}::text ILIKE ${`%${search}%`}`
        )
      )
    }

    if (company !== "all") {
      conditions.push(eq(interviewers.company, company))
    }

    if (pricingType !== "all") {
      conditions.push(eq(interviewers.pricingType, pricingType))
    }

    // Array/JSON contains checks
    if (specialization !== "all") {
      conditions.push(sql`${interviewers.specializations}::jsonb ?? ${specialization}`)
    }

    if (interviewType !== "all") {
      conditions.push(sql`${interviewers.interviewTypes}::jsonb ?? ${interviewType}`)
    }

    if (language !== "all") {
      conditions.push(sql`${interviewers.languages}::jsonb ?? ${language}`)
    }

    if (category !== "all") {
      conditions.push(sql`${interviewers.interviewCategories}::jsonb ?? ${category}`)
    }

    let orderExpression: any = desc(interviewers.rating)
    if (sortBy === "price_low") {
      orderExpression = asc(interviewers.hourlyCharges)
    } else if (sortBy === "price_high") {
      orderExpression = desc(interviewers.hourlyCharges)
    } else if (sortBy === "experience") {
      orderExpression = desc(interviewers.experience)
    } else if (sortBy === "recently_joined") {
      orderExpression = desc(interviewers.createdAt)
    }

    const list = await db
      .select({
        id: interviewers.id,
        userId: interviewers.userId,
        name: interviewers.name,
        email: interviewers.email,
        company: interviewers.company,
        role: interviewers.role,
        department: interviewers.department,
        experience: interviewers.experience,
        specializations: interviewers.specializations,
        bio: interviewers.bio,
        avatar: interviewers.avatar,
        rating: interviewers.rating,
        totalInterviews: interviewers.totalInterviews,
        availability: interviewers.availability,
        interviewTypes: interviewers.interviewTypes,
        pricingType: interviewers.pricingType,
        hourlyCharges: interviewers.hourlyCharges,
        verificationStatus: interviewers.verificationStatus,
        languages: interviewers.languages,
        interviewCategories: interviewers.interviewCategories,
        linkedIn: interviewers.linkedIn,
        github: interviewers.github,
        portfolio: interviewers.portfolio,
        userImage: users.image,
      })
      .from(interviewers)
      .leftJoin(users, eq(interviewers.userId, users.id))
      .where(and(...conditions))
      .orderBy(orderExpression)

    const responseData = list.map((i) => {
      let finalAvatar = i.avatar
      if (finalAvatar && finalAvatar.includes("photo-1494790108377-be9c29b29330")) {
        finalAvatar = null
      }
      return {
        ...i,
        avatar: finalAvatar || i.userImage || null,
        _id: i.id, // For backward compatibility
      }
    })

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("Fetch interviewers API error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch interviewers" }, { status: 550 })
  }
}
