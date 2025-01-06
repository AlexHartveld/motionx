import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { goalId: string } }
) {
  try {
    const session = auth();
    const { userId } = await session;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const goalId = parseInt(params.goalId);

    if (isNaN(goalId)) {
      return new NextResponse("Invalid goal ID", { status: 400 });
    }

    await prisma.goal.delete({
      where: {
        id: goalId,
        userId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { goalId: string } }
) {
  try {
    const session = auth();
    const { userId } = await session;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const goalId = parseInt(params.goalId);

    if (isNaN(goalId)) {
      return new NextResponse("Invalid goal ID", { status: 400 });
    }

    const body = await req.json();

    if (typeof body.completed !== 'boolean') {
      return new NextResponse("Invalid completed status", { status: 400 });
    }

    const goal = await prisma.goal.update({
      where: {
        id: goalId,
        userId,
      },
      data: {
        completed: body.completed,
      },
    });

    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 