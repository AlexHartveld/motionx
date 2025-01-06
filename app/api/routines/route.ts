import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function GET() {
  try {
    headers();
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const routines = await prisma.routine.findMany({
      where: {
        userId,
        archivedAt: null,
      },
      include: {
        logs: {
          orderBy: {
            completedAt: 'desc'
          },
          take: 1
        },
        focusSessions: {
          where: {
            endTime: null
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(routines);
  } catch (error) {
    console.error('[ROUTINES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    headers();
    const session = await auth();
    const { userId } = session;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.frequency) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const routine = await prisma.routine.create({
      data: {
        userId,
        name: body.name,
        description: body.description || "",
        frequency: body.frequency,
        targetCount: body.targetCount || 1,
        targetTime: body.targetTime || 30,
      },
    });

    return NextResponse.json(routine);
  } catch (error) {
    console.error("[ROUTINES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 