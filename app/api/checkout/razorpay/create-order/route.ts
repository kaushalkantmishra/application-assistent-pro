import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
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
    const { planCode } = await request.json()

    let price = 0
    if (planCode === "Premium") price = 1900
    else if (planCode === "Enterprise") price = 4900

    const mockOrderId = `order_${crypto.randomUUID().substring(0, 12)}`

    return NextResponse.json({
      orderId: mockOrderId,
      amount: price,
      currency: "USD",
    })
  } catch (error: any) {
    console.error("POST Create Order Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create payment order" }, { status: 500 })
  }
}
