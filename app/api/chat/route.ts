import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Chat } from '@/lib/models'

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

    // Try DeepSeek API first, fallback to local responses
    if (process.env.DEEPSEEK_API_KEY) {
      try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [{
              role: 'user',
              content: message
            }],
            max_tokens: 300,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const aiResponse = data.choices[0]?.message?.content
          if (aiResponse) {
            return NextResponse.json({ response: aiResponse })
          }
        }
      } catch (error) {
        console.log('DeepSeek API unavailable, using fallback')
      }
    }

    // Fallback to local responses
    const response = getJobAdvice(message)
    
    // Store chat message in MongoDB
    try {
      const client = await clientPromise
      const db = client.db('jobapp')
      
      const chat: Omit<Chat, '_id'> = {
        sessionId: 'anonymous',
        message,
        response,
        category: getChatCategory(message),
        timestamp: new Date()
      }
      
      await db.collection<Chat>('chats').insertOne(chat)
    } catch (dbError) {
      console.log('Failed to store chat:', dbError)
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