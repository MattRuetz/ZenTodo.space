// src/app/api/spaces/[spaceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

import Space from '@/models/Space';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { spaceId: string } }
) {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { maxZIndex } = await request.json();

    const updatedSpace = await Space.findOneAndUpdate(
        {
            _id: new ObjectId(params.spaceId),
            userId: new ObjectId(session.user.id),
        },
        { maxZIndex },
        { new: true }
    );

    if (!updatedSpace) {
        return NextResponse.json({ error: 'Space not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSpace);
}
