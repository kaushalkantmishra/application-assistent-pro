import { ObjectId } from 'mongodb'

export interface Application {
  _id?: ObjectId
  userId: ObjectId
  jobId: ObjectId
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired'
  coverLetter?: string
  resume: string
  appliedAt: Date
  reviewedAt?: Date
  notes?: string
  interviewScheduled?: {
    date: Date
    type: 'phone' | 'video' | 'in_person'
    interviewer: ObjectId
  }
  createdAt: Date
  updatedAt: Date
}

export interface CreateApplicationInput {
  userId: ObjectId
  jobId: ObjectId
  coverLetter?: string
  resume: string
}