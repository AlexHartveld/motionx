import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import * as db from '@/lib/db'

export async function DELETE(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  const { userId } = auth()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const habit = await db.archiveHabit(params.habitId, userId)
    return NextResponse.json(habit)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 