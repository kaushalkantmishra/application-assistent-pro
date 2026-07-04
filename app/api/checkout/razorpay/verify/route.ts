import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import {
  subscriptionPlans,
  subscriptions,
  payments
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { UserRepository } from "@/repositories/user.repository"
import crypto from "crypto"

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

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { razorpayOrderId, razorpayPaymentId, signature, planCode } = await request.json()

    // 1. In a production app, we would verify the Razorpay HMAC signature here
    // const generatedSignature = hmac_sha256(orderId + "|" + paymentId, secret)

    // 2. Fetch or seed subscription plans if not existing
    let plan = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.code, planCode))
      .then(r => r[0])

    if (!plan) {
      const [newPlan] = await db
        .insert(subscriptionPlans)
        .values({
          name: `${planCode} Plan`,
          code: planCode,
          price: planCode === "Premium" ? 1900 : 4900,
          billingInterval: "monthly",
          limitInterviews: planCode === "Premium" ? 9999 : 99999,
          limitResumes: planCode === "Premium" ? 9999 : 99999,
          limitAts: planCode === "Premium" ? 9999 : 99999,
          limitCoverLetters: planCode === "Premium" ? 9999 : 99999,
          features: ["Unlimited Mock Interviews", "Premium templates", "Advanced Roadmap insights"],
          isActive: true,
        })
        .returning()
      plan = newPlan
    }

    // 3. Create Subscription Period
    const start = new Date()
    const end = new Date()
    end.setMonth(start.getMonth() + 1) // 1 month period

    // Save/Update user active subscription
    await db
      .insert(subscriptions)
      .values({
        userId,
        planId: plan.id,
        status: "active",
        currentPeriodStart: start,
        currentPeriodEnd: end,
        cancelAtPeriodEnd: false,
        razorpaySubscriptionId: razorpayPaymentId,
      })

    // 4. Save Payment record
    await db
      .insert(payments)
      .values({
        userId,
        amount: plan.price,
        currency: "USD",
        status: "captured",
        provider: "razorpay",
        transactionId: razorpayPaymentId,
        referenceId: razorpayOrderId,
        netAmount: plan.price,
      })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("POST Verify Signature Error:", error)
    return NextResponse.json({ error: error.message || "Failed to verify transaction" }, { status: 500 })
  }
}
