import { NextResponse, NextRequest } from 'next/server'
import { getAuth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const goals = await prisma.goal.findMany({
      where: { 
        userId
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(goals)
  } catch (error) {
    console.error('Error fetching goals:', error instanceof Error ? error.message : 'Unknown error')
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req)

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()

    if (!body.description || typeof body.description !== 'string') {
      return new NextResponse("Invalid description", { status: 400 })
    }

    const goal = await prisma.goal.create({
      data: {
        userId,
        description: body.description,
        completed: false
      }
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error('Error creating goal:', error instanceof Error ? error.message : 'Unknown error')
    return new NextResponse("Internal Error", { status: 500 })
  }
} 