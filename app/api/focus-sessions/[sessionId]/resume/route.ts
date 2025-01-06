import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await auth();
    const userId = session.userId;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { sessionId } = params;
    const data = await request.json();

    // Verify that the session belongs to the user
    const existingSession = await prisma.focusSession.findUnique({
      where: { id: sessionId },
      include: {
        routine: true
      }
    });

    if (!existingSession || existingSession.userId !== userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!existingSession.pausedAt) {
      return new NextResponse("Session not paused", { status: 400 });
    }

    const { resumedAt } = data;
    const pausedTime = Math.floor(
      (new Date(resumedAt).getTime() - existingSession.pausedAt.getTime()) / 1000
    );

    const focusSession = await prisma.focusSession.update({
      where: { id: sessionId },
      data: {
        isPaused: false,
        pausedAt: null,
        totalPaused: {
          increment: pausedTime
        }
      },
      include: {
        routine: true
      }
    });

    return NextResponse.json(focusSession);
  } catch (error) {
    console.error('Error resuming focus session:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 