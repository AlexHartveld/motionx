import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const routines = await prisma.routine.findMany({
      where: {
        userId: userId,
        archivedAt: null,
      },
      include: {
        logs: true,
        focusSessions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(routines);
  } catch (error) {
    console.error("Error fetching routines:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const routine = await prisma.routine.create({
      data: {
        userId,
        name: body.name,
        description: body.description,
        frequency: body.frequency,
        targetCount: body.targetCount,
        targetTime: body.targetTime,
      },
    });

    return NextResponse.json(routine);
  } catch (error) {
    console.error("Error creating routine:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 