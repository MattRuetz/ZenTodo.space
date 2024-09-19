import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getUserId } from '@/hooks/useGetUserId';
import dbConnect from '@/lib/mongodb';
import Space from '@/models/Space';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';
import { SpaceData } from '@/types';

export async function PUT(req: NextRequest, res: NextResponse) {
    const session = await getServerSession(authOptions);
    const userId = await getUserId(req);
    if (!userId || !session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    try {
        const body = await req.json();
        const spaces = body.spaces;

        // Use a bulk write operation for efficiency
        const bulkOps = spaces.map((space: SpaceData, index: number) => ({
            updateOne: {
                filter: { _id: new ObjectId(space._id) },
                update: { $set: { order: index } },
            },
        }));

        await Space.bulkWrite(bulkOps);

        // Fetch the updated spaces, sorted by the new order
        const updatedSpaces = await Space.find({ userId: new ObjectId(userId) })
            .sort('order')
            .lean();

        return NextResponse.json({ spaces: updatedSpaces }, { status: 200 });
    } catch (error) {
        console.error('Error reordering spaces:', error);
        return NextResponse.json(
            { message: 'Error reordering spaces' },
            { status: 500 }
        );
    }
}
