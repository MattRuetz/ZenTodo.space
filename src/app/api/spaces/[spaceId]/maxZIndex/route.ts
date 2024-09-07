import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Space from '@/models/Space';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function GET(
    request: NextRequest,
    { params }: { params: { spaceId: string } }
) {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const space = await Space.findOne({
            _id: new ObjectId(params.spaceId),
            userId: new ObjectId(session.user.id),
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
