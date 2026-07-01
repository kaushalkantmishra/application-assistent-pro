import { NextRequest, NextResponse } from "next/server"
import { UserRepository } from "@/repositories/user.repository"
import { z } from "zod"

const CreateUserSchema = z.object({
  name: z.string().optional().nullable(),
  email: z.string().email("Invalid email address"),
  image: z.string().optional().nullable(),
  role: z.string().default("job_seeker"),
})

export async function GET() {
  try {
    // In Drizzle, we can query users
    // Let's implement a clean query to fetch all users
    const result = await UserRepository.findByEmail("test@example.com") // Just to demonstrate or mock, let's fetch all users from users table
    // Wait, let's export a generic find all users or query directly
    const { db } = await import("@/db")
    const { users } = await import("@/db/schema")
    const allUsers = await db.select().from(users)
    
    const responseData = allUsers.map((user) => ({
      ...user,
      _id: user.id, // For backward compatibility
    }))
    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = CreateUserSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 })
    }

    const user = await UserRepository.create({
      email: parsed.data.email,
      name: parsed.data.name || null,
      image: parsed.data.image || null,
      role: parsed.data.role,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Create user API error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}