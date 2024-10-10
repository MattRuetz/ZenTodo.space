import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Space from '@/models/Space';
import { getAuth } from '@clerk/nextjs/server';
import User from '@/models/User';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { spaceId: string } }
) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);
        const { spaceId } = params;
        const { taskOrder } = await req.json();

        const space = await Space.findOne({ _id: spaceId, userId: userId });
        if (!space) {
            return NextResponse.json(
                { error: 'Space not found' },
                { status: 404 }
            );
        }

        space.taskOrder = taskOrder;
        await space.save();

        return NextResponse.json(space);
    } catch (error) {
        console.error('Error updating space task order:', error);
        return NextResponse.json(
            { error: 'Failed to update space task order' },
            { status: 500 }
        );
    }
}
