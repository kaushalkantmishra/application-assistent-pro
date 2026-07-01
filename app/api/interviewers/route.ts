import { NextResponse } from "next/server"
import { db } from "@/db"
import { interviewers } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const list = await db
      .select()
      .from(interviewers)
      .orderBy(desc(interviewers.createdAt))
      
    const responseData = list.map((i) => ({
      ...i,
      _id: i.id, // For backward compatibility
    }))
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Fetch interviewers API error:", error)
    return NextResponse.json({ error: "Failed to fetch interviewers" }, { status: 500 })
  }
}
