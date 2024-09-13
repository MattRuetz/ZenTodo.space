import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const { parentId, subtaskIds } = await req.json();

        const parentTask = await Task.findOne({ _id: parentId, user: userId });
        if (!parentTask) {
            return NextResponse.json(
                { error: 'Parent task not found' },
                { status: 404 }
            );
        }

        parentTask.subtasks = subtaskIds;
        await parentTask.save();

        return NextResponse.json({ parentId, updatedSubtasks: subtaskIds });
    } catch (error) {
        console.error('Error updating subtask order:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
