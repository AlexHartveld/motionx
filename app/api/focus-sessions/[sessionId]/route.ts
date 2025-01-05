import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function POST(
  req: Request,
  { params }: { params: { sessionId: string } }
) {
  await headers();
  const session = await auth();
  const userId = session.userId;

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { sessionId } = params;
  const path = new URL(req.url).pathname;

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

  try {
    if (path.endsWith('/pause')) {
      const focusSession = await prisma.focusSession.update({
        where: { id: sessionId },
        data: {
          isPaused: true,
          pausedAt: new Date(),
        },
        include: {
          routine: true
        }
      });
      return NextResponse.json(focusSession);
    }

    if (path.endsWith('/resume')) {
      const session = await prisma.focusSession.findUnique({
        where: { id: sessionId },
        include: {
          routine: true
        }
      });

      if (!session) {
        return new NextResponse("Session not found", { status: 404 });
      }

      const pausedTime = session.pausedAt 
        ? Math.floor((new Date().getTime() - session.pausedAt.getTime()) / 1000)
        : 0;

      const focusSession = await prisma.focusSession.update({
        where: { id: sessionId },
        data: {
          isPaused: false,
          pausedAt: null,
          totalPaused: {
            increment: pausedTime
          },
        },
        include: {
          routine: true
        }
      });
      return NextResponse.json(focusSession);
    }

    if (path.endsWith('/end')) {
      const body = await req.json();
      const { duration } = body;

      const focusSession = await prisma.focusSession.update({
        where: { id: sessionId },
        data: {
          endTime: new Date(),
          duration,
        },
        include: {
          routine: true
        }
      });
      return NextResponse.json(focusSession);
    }

    return new NextResponse("Invalid operation", { status: 400 });
  } catch (error) {
    console.error('Error managing focus session:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 