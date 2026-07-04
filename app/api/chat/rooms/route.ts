import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/db"
import { chatRooms, chatParticipants, users, interviewers } from "@/db/schema"
import { UserRepository } from "@/repositories/user.repository"
import { eq, and, inArray } from "drizzle-orm"

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

    // Find all participant records for current user
    const userParticipants = await db
      .select()
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, userId))

    const roomIds = userParticipants.map((p) => p.roomId)
    if (roomIds.length === 0) {
      return NextResponse.json([])
    }

    // Fetch all participants in those rooms to display contact names
    const allParticipants = await db
      .select({
        roomId: chatParticipants.roomId,
        userId: chatParticipants.userId,
        name: users.name,
        image: users.image,
      })
      .from(chatParticipants)
      .leftJoin(users, eq(chatParticipants.userId, users.id))
      .where(inArray(chatParticipants.roomId, roomIds))

    // Form list response
    const grouped: Record<string, any[]> = {}
    allParticipants.forEach((p) => {
      if (!grouped[p.roomId]) grouped[p.roomId] = []
      grouped[p.roomId].push({
        userId: p.userId,
        name: p.name || "User",
        image: p.image || null,
      })
    })

    const roomsList = Object.keys(grouped).map((roomId) => {
      const other = grouped[roomId].find((u) => u.userId !== userId) || { name: "Chat Partner", userId: "" }
      return {
        id: roomId,
        partner: other,
        participants: grouped[roomId],
      }
    })

    return NextResponse.json(roomsList)
  } catch (error: any) {
    console.error("GET Chat Rooms Error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch chat rooms" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback()
    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    let resolvedTargetUserId = targetUserId

    // Check if targetUserId is an interviewer profile ID
    const interviewerProfile = await db
      .select({ userId: interviewers.userId })
      .from(interviewers)
      .where(eq(interviewers.id, targetUserId))
      .then((res) => res[0])

    if (interviewerProfile) {
      if (interviewerProfile.userId) {
        resolvedTargetUserId = interviewerProfile.userId
      } else {
        // Mock interviewer has null userId, dynamically create one
        const fullInterviewer = await db
          .select()
          .from(interviewers)
          .where(eq(interviewers.id, targetUserId))
          .then((res) => res[0])

        if (fullInterviewer) {
          // Generate a unique email if not present
          const email = fullInterviewer.email || `mock-${fullInterviewer.id}@example.com`
          
          // Check if user already exists with that email
          let existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .then((res) => res[0])

          if (!existingUser) {
            const [newUser] = await db
              .insert(users)
              .values({
                email,
                name: fullInterviewer.name,
                role: "interviewer",
                image: fullInterviewer.avatar,
              })
              .returning()
            existingUser = newUser
          }

          // Link interviewer to the user
          await db
            .update(interviewers)
            .set({ userId: existingUser.id })
            .where(eq(interviewers.id, targetUserId))

          resolvedTargetUserId = existingUser.id
        }
      }
    }

    // Check if a 1-to-1 room already exists between these two users
    const myRooms = await db
      .select({ roomId: chatParticipants.roomId })
      .from(chatParticipants)
      .where(eq(chatParticipants.userId, userId))

    const myRoomIds = myRooms.map(r => r.roomId)
    let existingRoomId: string | null = null

    if (myRoomIds.length > 0) {
      const commonRoom = await db
        .select({ roomId: chatParticipants.roomId })
        .from(chatParticipants)
        .where(eq(chatParticipants.userId, resolvedTargetUserId))
        .then(res => res.find(r => myRoomIds.includes(r.roomId)))

      if (commonRoom) {
        existingRoomId = commonRoom.roomId
      }
    }

    if (existingRoomId) {
      return NextResponse.json({ id: existingRoomId })
    }

    // Create new chat room
    const [newRoom] = await db
      .insert(chatRooms)
      .values({})
      .returning()

    // Add participants
    await db.insert(chatParticipants).values([
      { roomId: newRoom.id, userId },
      { roomId: newRoom.id, userId: resolvedTargetUserId },
    ])

    return NextResponse.json({ id: newRoom.id })
  } catch (error: any) {
    console.error("POST Chat Room Error:", error)
    return NextResponse.json({ error: error.message || "Failed to create chat room" }, { status: 500 })
  }
}
