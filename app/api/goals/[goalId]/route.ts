import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { goalId: string } }
) {
  try {
    const { userId } = await auth();

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
    return new NextResponse("Internal Error", { status: 500 });
  }
} 