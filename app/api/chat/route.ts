import { NextRequest, NextResponse } from "next/server"
import { ChatRepository } from "@/repositories/chat.repository"

const jobResponses = {
  resume: "Focus on quantifiable achievements, use action verbs, and tailor your resume to each job. Keep it to 1-2 pages and include relevant keywords from the job description.",
  interview: "Research the company thoroughly, practice common questions, prepare specific examples using the STAR method, and have thoughtful questions ready about the role and company culture.",
  application: "Customize your cover letter for each position, follow application instructions precisely, and apply within the first few days of posting for better visibility.",
  salary: "Research market rates using sites like Glassdoor, consider the full compensation package, and be prepared to negotiate based on your value and experience.",
  networking: "Attend industry events, engage on LinkedIn, reach out to alumni, and offer value before asking for help. Quality connections matter more than quantity.",
  skills: "Identify in-demand skills in your field, take online courses, work on projects to demonstrate abilities, and get certifications relevant to your target roles."
}

function getChatCategory(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('resume') || msg.includes('cv')) return 'resume'
  if (msg.includes('interview')) return 'interview'
  if (msg.includes('apply') || msg.includes('application')) return 'application'
  if (msg.includes('salary') || msg.includes('negotiate')) return 'salary'
  if (msg.includes('network') || msg.includes('connect')) return 'networking'
  if (msg.includes('skill') || msg.includes('learn')) return 'skills'
  return 'general'
}

function getJobAdvice(message: string): string {
  const msg = message.toLowerCase()
  
  if (msg.includes('resume') || msg.includes('cv')) return jobResponses.resume
  if (msg.includes('interview')) return jobResponses.interview
  if (msg.includes('apply') || msg.includes('application')) return jobResponses.application
  if (msg.includes('salary') || msg.includes('negotiate')) return jobResponses.salary
  if (msg.includes('network') || msg.includes('connect')) return jobResponses.networking
  if (msg.includes('skill') || msg.includes('learn')) return jobResponses.skills
  
  return "I can help with resumes, interviews, applications, salary negotiation, networking, and skill development. What specific area would you like guidance on?"
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    let response = ""

    // Try Gemini API first
    if (process.env.GEMINI_API_KEY) {
      try {
        const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: message
              }]
            }],
            generationConfig: {
              maxOutputTokens: 300,
            }
          }),
        })

        if (apiResponse.ok) {
          const data = await apiResponse.json()
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (aiResponse) {
            response = aiResponse
          }
        } else {
          console.log("Gemini API returned status:", apiResponse.status)
        }
      } catch (error) {
        console.log("Gemini API unavailable, using fallback")
      }
    }

    if (!response) {
      // Fallback to local responses
      response = getJobAdvice(message)
    }
    
    // Store chat message in PostgreSQL using ChatRepository
    try {
      await ChatRepository.create({
        sessionId: 'anonymous',
        message,
        response,
        category: getChatCategory(message),
      })
    } catch (dbError) {
      console.log('Failed to store chat in database:', dbError)
    }
    
    return NextResponse.json({ response })
    
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    )
  }
}