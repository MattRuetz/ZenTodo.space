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
    try {
        await connectToDatabase();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const updateData = await request.json();
        const allowedFields = ['maxZIndex', 'selectedEmojis'];
        const filteredUpdateData: { [key: string]: any } = {};

        // Filter out any fields that are not allowed to be updated
        for (const field of allowedFields) {
            if (field in updateData) {
                filteredUpdateData[field] = updateData[field];
            }
        }

        // Validate selectedEmojis if it's present
        if ('selectedEmojis' in filteredUpdateData) {
            if (!Array.isArray(filteredUpdateData.selectedEmojis)) {
                return NextResponse.json(
                    { error: 'selectedEmojis must be an array' },
                    { status: 400 }
                );
            }
            // You might want to add more specific emoji validation here
        }

        // Only update if there are valid fields to update
        if (Object.keys(filteredUpdateData).length === 0) {
            return NextResponse.json(
                { error: 'No valid fields to update' },
                { status: 400 }
            );
        }

        const updatedSpace = await Space.findOneAndUpdate(
            {
                _id: new ObjectId(params.spaceId),
                userId: new ObjectId(session.user.id),
            },
            { $set: filteredUpdateData },
            { new: true }
        );

        if (!updatedSpace) {
            return NextResponse.json(
                { error: 'Space not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedSpace);
    } catch (error) {
        console.error('Error updating space:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
