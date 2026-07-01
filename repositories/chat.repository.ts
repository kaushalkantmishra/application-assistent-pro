import { db } from "@/db"
import { chatHistory } from "@/db/schema"
import { eq, desc, and, isNull } from "drizzle-orm"

export interface ChatInput {
  userId?: string | null
  sessionId: string
  message: string
  response: string
  category?: string | null
}

export class ChatRepository {
  static async create(data: ChatInput) {
    const result = await db
      .insert(chatHistory)
      .values({
        ...data,
        timestamp: new Date(),
      })
      .returning()
    return result[0]
  }

  static async findBySessionId(sessionId: string) {
    return await db
      .select()
      .from(chatHistory)
      .where(and(eq(chatHistory.sessionId, sessionId), isNull(chatHistory.deletedAt)))
      .orderBy(desc(chatHistory.timestamp))
  }

  static async findByUserId(userId: string) {
    return await db
      .select()
      .from(chatHistory)
      .where(and(eq(chatHistory.userId, userId), isNull(chatHistory.deletedAt)))
      .orderBy(desc(chatHistory.timestamp))
  }
}
