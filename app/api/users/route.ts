import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { User, CreateUserInput } from '@/lib/models'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jobapp')
    const users = await db.collection('users').find({}).toArray()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db('jobapp')
    const data: CreateUserInput = await request.json()
    
    const user: Omit<User, '_id'> = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection<User>('users').insertOne(user)
    return NextResponse.json({ id: result.insertedId }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}