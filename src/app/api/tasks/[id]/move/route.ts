// src/app/api/tasks/[id]/move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const { spaceId } = await req.json();

        const task = await Task.findOneAndUpdate(
            { _id: params.id, user: userId },
            { space: spaceId },
            { new: true }
        );

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ task });
    } catch (error) {
        console.error('Error moving task:', error);
        return NextResponse.json(
            { error: 'Failed to move task' },
            { status: 500 }
        );
    }
}
