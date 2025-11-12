import { ObjectId } from 'mongodb'

export interface Interview {
  _id?: ObjectId
  applicationId: ObjectId
  interviewerId: ObjectId
  candidateId: ObjectId
  jobId: ObjectId
  scheduledAt: Date
  duration: number
  type: 'phone' | 'video' | 'in_person'
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  meetingLink?: string
  location?: string
  feedback?: {
    rating: number
    comments: string
    recommendation: 'hire' | 'reject' | 'maybe'
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateInterviewInput {
  applicationId: ObjectId
  interviewerId: ObjectId
  candidateId: ObjectId
  jobId: ObjectId
  scheduledAt: Date
  duration: number
  type: 'phone' | 'video' | 'in_person'
  meetingLink?: string
  location?: string
}