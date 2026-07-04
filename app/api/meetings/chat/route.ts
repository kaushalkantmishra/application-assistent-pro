import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { meetingChat, users } from "@/db/schema"
import { eq, desc, asc } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get("roomId")

    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
    }

    const messages = await db
      .select({
        id: meetingChat.id,
        messageText: meetingChat.messageText,
        createdAt: meetingChat.createdAt,
        senderId: meetingChat.senderId,
        sender: {
          name: users.name,
          image: users.image,
        },
      })
      .from(meetingChat)
      .innerJoin(users, eq(meetingChat.senderId, users.id))
      .where(eq(meetingChat.roomId, roomId))
      .orderBy(asc(meetingChat.createdAt))

    return NextResponse.json(messages)
  } catch (error: any) {
    console.error("GET Meeting Chat error:", error)
    return NextResponse.json({ error: error.message || "Failed to load chat history" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { roomId, messageText } = await request.json()
    if (!roomId || !messageText) {
      return NextResponse.json({ error: "Room ID and Message are required" }, { status: 400 })
    }

    const [newMessage] = await db
      .insert(meetingChat)
      .values({
        roomId,
        senderId: session.user.id,
        messageText,
      })
      .returning()

    return NextResponse.json(newMessage)
  } catch (error: any) {
    console.error("POST Meeting Chat error:", error)
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 })
  }
}
