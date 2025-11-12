import { ObjectId } from 'mongodb'

export interface User {
  _id?: ObjectId
  name: string
  email: string
  role: 'job_seeker' | 'interviewer' | 'admin'
  phone?: string
  location?: string
  skills?: string[]
  experience?: number
  resume?: string
  profileImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserInput {
  name: string
  email: string
  role: 'job_seeker' | 'interviewer' | 'admin'
  phone?: string
  location?: string
  skills?: string[]
  experience?: number
  resume?: string
  profileImage?: string
}