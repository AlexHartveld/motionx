import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await request.json();
    const { routineId, startTime } = data;

    if (!routineId || !startTime) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify that the routine belongs to the user
    const routine = await prisma.routine.findUnique({
      where: { id: routineId }
    });

    if (!routine || routine.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const focusSession = await prisma.focusSession.create({
      data: {
        routineId,
        userId,
        startTime: new Date(startTime),
        isPaused: false,
        totalPaused: 0
      },
      include: {
        routine: true
      }
    });

    return NextResponse.json(focusSession);
  } catch (error) {
    console.error('Error creating focus session:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const activeSessions = await prisma.focusSession.findMany({
      where: {
        userId,
        endTime: null
      },
      include: {
        routine: true
      }
    });

    return NextResponse.json(activeSessions);
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 