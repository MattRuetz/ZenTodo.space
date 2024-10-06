import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Space from '@/models/Space';
import { ObjectId } from 'mongodb';
import { SpaceData } from '@/types';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function PUT(req: NextRequest, res: NextResponse) {
    await dbConnect();

    const userId = await getUserIdFromClerk(req);

    if (!userId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

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
