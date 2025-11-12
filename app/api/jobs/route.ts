import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Job, CreateJobInput } from '@/lib/models'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jobapp')
    const jobs = await db.collection('jobs').find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(jobs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('jobapp')
    const data: CreateJobInput = await request.json()
    
    const job: Omit<Job, '_id'> = {
      ...data,
      status: 'active',
      applicationsCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection<Job>('jobs').insertOne(job)
    return NextResponse.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}