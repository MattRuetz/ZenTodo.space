// src/app/api/spaces/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Space from '@/models/Space';
import { getAuth } from '@clerk/nextjs/server';
import User from '@/models/User';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function GET(req: NextRequest) {
    await dbConnect();
    const userId = await getUserIdFromClerk(req);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const spaces = await Space.find({ userId }).sort('order');
    return NextResponse.json(spaces);
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const { userId: clerkId } = getAuth(req);

    const user = await User.findOne({ clerkId });
    const userId = user?._id;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { color, name, order } = await req.json();

    const newSpace = await Space.create({
        name,
        color,
        userId,
        order,
        maxZIndex: 0,
        emoji: '',
        selectedEmojis: [],
    });

    return NextResponse.json(newSpace);
}
