import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { platformSettings } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = await db
      .select()
      .from(platformSettings)
      .then(r => r[0])

    if (!settings) {
      const [newSettings] = await db
        .insert(platformSettings)
        .values({
          maintenanceMode: false,
          theme: "dark",
          branding: { name: "Application Assistant Pro" },
          seo: { title: "AI Career Accelerator Dashboard" },
        })
        .returning()
      settings = newSettings
    }

    return NextResponse.json(settings)
  } catch (error: any) {
    console.error("GET Admin Settings Error:", error)
    return NextResponse.json({ error: error.message || "Failed to load platform settings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { maintenanceMode, theme, branding, seo } = body

    const existing = await db.select().from(platformSettings).then(r => r[0])

    let updated
    if (existing) {
      [updated] = await db
        .update(platformSettings)
        .set({
          maintenanceMode,
          theme,
          branding: branding || existing.branding,
          seo: seo || existing.seo,
          updatedAt: new Date(),
        })
        .where(eq(platformSettings.id, existing.id))
        .returning()
    } else {
      [updated] = await db
        .insert(platformSettings)
        .values({
          maintenanceMode: !!maintenanceMode,
          theme: theme || "dark",
          branding: branding || {},
          seo: seo || {},
        })
        .returning()
    }

    return NextResponse.json(updated)
  } catch (error: any) {
    console.error("POST Admin Settings Error:", error)
    return NextResponse.json({ error: error.message || "Failed to update platform settings" }, { status: 500 })
  }
}
