import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { subscriptions, subscriptionPlans } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import { UserRepository } from "@/repositories/user.repository"

async function getUserIdOrFallback() {
  const session = await auth()
  let userId = session?.user?.id
  if (!userId) {
    let testUser = await UserRepository.findByEmail("test@example.com")
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test@example.com",
        name: "Test User",
        role: "job_seeker",
      })
    }
    userId = testUser.id
  }
  return userId
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()

    const activeSubscription = await db
      .select()
      .from(subscriptions)
      .innerJoin(subscriptionPlans, eq(subscriptions.planId, subscriptionPlans.id))
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .then(r => r[0])

    if (!activeSubscription) {
      return NextResponse.json({ planCode: "Free" })
    }

    return NextResponse.json({
      planCode: activeSubscription.subscription_plans.code,
      status: activeSubscription.subscriptions.status,
      periodEnd: activeSubscription.subscriptions.currentPeriodEnd,
    })
  } catch (error: any) {
    console.error("GET Subscription Error:", error)
    return NextResponse.json({ error: error.message || "Failed to retrieve subscription" }, { status: 500 })
  }
}
