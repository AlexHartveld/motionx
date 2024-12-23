import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import * as db from '@/lib/db';

export async function GET() {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const habits = await db.getHabits(userId);
    return NextResponse.json(habits);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const habit = await db.createHabit(userId, body);
    return NextResponse.json(habit);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
} 