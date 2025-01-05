import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/session';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        theme: body.theme,
        soundEnabled: body.soundEnabled,
        notificationsEnabled: body.notificationsEnabled,
        focusDuration: body.focusDuration,
        breakDuration: body.breakDuration,
      },
      create: {
        userId: user.id,
        theme: body.theme,
        soundEnabled: body.soundEnabled,
        notificationsEnabled: body.notificationsEnabled,
        focusDuration: body.focusDuration,
        breakDuration: body.breakDuration,
      },
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
} 