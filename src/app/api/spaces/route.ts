// src/app/api/spaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Space from '@/models/Space';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET() {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spaces = await Space.find({ userId: session.user.id });
    return NextResponse.json(spaces);
}

export async function POST(req: NextRequest) {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color } = await req.json();
    const newSpace = await Space.create({
        name,
        color,
        userId: session.user.id,
        maxZIndex: 1, // Initialize maxZIndex to 1
    });

    return NextResponse.json(newSpace);
}
