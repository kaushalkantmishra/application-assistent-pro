import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { chatMessages, chatParticipants } from "@/db/schema"
import { UserRepository } from "@/repositories/user.repository"
import { eq, and, like, desc, asc } from "drizzle-orm"

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
  return userId;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")
    const search = searchParams.get("search") || ""

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    // Verify user is in this room
    const access = await db
      .select()
      .from(chatParticipants)
      .where(and(eq(chatParticipants.roomId, roomId), eq(chatParticipants.userId, userId)))
      .then(res => res[0])

    if (!access) {
      return NextResponse.json({ error: "Access denied to chat room" }, { status: 403 })
    }

    let queryCondition = eq(chatMessages.roomId, roomId)
    if (search) {
      queryCondition = and(eq(chatMessages.roomId, roomId), like(chatMessages.messageText, `%${search}%`)) as any
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(queryCondition)
      .orderBy(asc(chatMessages.createdAt))

    return NextResponse.json(messages)
  } catch (error: any) {
    console.error("GET Chat Messages Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const body = await request.json()
    const { roomId, messageText, attachments } = body

    if (!roomId || !messageText) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const [inserted] = await db
      .insert(chatMessages)
      .values({
        roomId,
        senderId: userId,
        messageText,
        attachments: attachments || [],
        isRead: false,
        isEdited: false,
        isPinned: false,
      })
      .returning()

    return NextResponse.json(inserted)
  } catch (error: any) {
    console.error("POST Chat Message Error:", error)
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Message ID is required" }, { status: 400 })
    }

    // Verify ownership of the message
    const [msg] = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.id, id))

    if (!msg) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    if (msg.senderId !== userId) {
      return NextResponse.json({ error: "Unauthorized delete request" }, { status: 403 })
    }

    await db.delete(chatMessages).where(eq(chatMessages.id, id))
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("DELETE Chat Message Error:", error)
    return NextResponse.json({ error: error.message || "Failed to delete message" }, { status: 500 })
  }
}
