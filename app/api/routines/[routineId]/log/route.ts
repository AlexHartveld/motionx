import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import * as db from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: { routineId: string } }
) {
  const { userId } = await auth()
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const log = await db.logRoutine(params.routineId, userId)
    return NextResponse.json(log)
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 })
  }
} 