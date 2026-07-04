import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { resumes, aiConversations } from "@/db/schema";
import { UserRepository } from "@/repositories/user.repository";
import { ResumeRepository } from "@/repositories/resume.repository";
import { CareerAssistantService } from "@/services/ai/career-assistant";
import { eq } from "drizzle-orm";

async function getUserIdOrFallback() {
  const session = await auth();
  let userId = session?.user?.id;
  if (!userId) {
    let testUser = await UserRepository.findByEmail("test@example.com");
    if (!testUser) {
      testUser = await UserRepository.create({
        email: "test@example.com",
        name: "Test User",
        role: "job_seeker",
      });
    }
    userId = testUser.id;
  }
  return userId;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdOrFallback();
    const body = await request.json();
    const { messages, resumeId, conversationId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    let resumeContext: any = null;
    if (resumeId) {
      const resume = await ResumeRepository.findById(resumeId);
      if (resume) {
        resumeContext = resume.resumeJson;
      }
    }

    // Call career assistant generator
    const stream = CareerAssistantService.streamAdvisorChat(messages, resumeContext);

    // Set up SSE response stream
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (e: any) {
          controller.error(e);
        }
      },
    });

    // Save conversation history to db (in background)
    try {
      const userMessage = messages[messages.length - 1]?.content || "Chat Session";
      const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? "..." : "");

      if (conversationId) {
        await db
          .update(aiConversations)
          .set({
            messages,
            updatedAt: new Date(),
          })
          .where(eq(aiConversations.id, conversationId));
      } else {
        await db.insert(aiConversations).values({
          userId,
          title,
          messages,
        });
      }
    } catch (dbErr) {
      console.error("Failed to save AI Conversation:", dbErr);
    }

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("AI Advisor Chat Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 550 });
  }
}
