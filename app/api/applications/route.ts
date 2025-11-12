import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { Application, CreateApplicationInput } from '@/lib/models'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jobapp')
    const applications = await db.collection('applications').find({}).sort({ createdAt: -1 }).toArray()
    return NextResponse.json(applications)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('jobapp')
    const data: CreateApplicationInput = await request.json()
    
    const application: Omit<Application, '_id'> = {
      ...data,
      status: 'pending',
      appliedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection<Application>('applications').insertOne(application)
    return NextResponse.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })
  }
}