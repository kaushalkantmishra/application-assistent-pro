import { ObjectId } from 'mongodb'

export interface Job {
  _id?: ObjectId
  title: string
  company: string
  description: string
  requirements: string[]
  location: string
  type: 'full_time' | 'part_time' | 'contract' | 'internship'
  salary?: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  experience: string
  status: 'active' | 'closed' | 'draft'
  postedBy: ObjectId
  applicationsCount: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateJobInput {
  title: string
  company: string
  description: string
  requirements: string[]
  location: string
  type: 'full_time' | 'part_time' | 'contract' | 'internship'
  salary?: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  experience: string
  postedBy: ObjectId
}