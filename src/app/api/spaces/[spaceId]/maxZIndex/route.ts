import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';
import Space from '@/models/Space';
import { ObjectId } from 'mongodb';
import dbConnect from '@/lib/mongodb';

export async function GET(
    req: NextRequest,
    { params }: { params: { spaceId: string } }
) {
    await dbConnect();

    const userId = await getUserIdFromClerk(req);

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const space = await Space.findOne({
            _id: new ObjectId(params.spaceId),
            userId,
        });

        if (!space) {
            return NextResponse.json(
                { error: 'Space not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ maxZIndex: space.maxZIndex });
    } catch (error) {
        console.error('Error fetching maxZIndex:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
