import { NextResponse } from "next/server"
import { db } from "@/db"
import { readingMaterials } from "@/db/schema"
import { desc } from "drizzle-orm"

export async function GET() {
  try {
    const materials = await db
      .select()
      .from(readingMaterials)
      .orderBy(desc(readingMaterials.createdAt))
      
    const responseData = materials.map((m) => ({
      ...m,
      _id: m.id, // For backward compatibility
    }))
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Fetch reading materials API error:", error)
    return NextResponse.json({ error: "Failed to fetch reading materials" }, { status: 500 })
  }
}
