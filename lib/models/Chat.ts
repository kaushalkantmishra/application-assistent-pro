import { ObjectId } from 'mongodb'

export interface Chat {
  _id?: ObjectId
  userId?: ObjectId
  sessionId: string
  message: string
  response: string
  category?: 'resume' | 'interview' | 'application' | 'salary' | 'networking' | 'skills' | 'general'
  timestamp: Date
}

export interface CreateChatInput {
  userId?: ObjectId
  sessionId: string
  message: string
  response: string
  category?: string
}