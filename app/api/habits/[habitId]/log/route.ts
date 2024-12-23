import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import * as db from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const habitLog = await db.logHabit(params.habitId, userId)
    return NextResponse.json(habitLog)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 