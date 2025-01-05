import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: Request,
  { params }: { params: { routineId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const routine = await prisma.routine.update({
      where: {
        id: params.routineId,
        userId,
      },
      data: {
        archivedAt: new Date(),
      },
    });

    return NextResponse.json(routine);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 