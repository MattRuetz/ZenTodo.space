import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';
import mongoose from 'mongoose';

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // milliseconds

async function moveSubtask(
    userId: string,
    subtaskId: string,
    parentId: string,
    newIndex: number,
    retryCount = 0
): Promise<any> {
    try {
        const subtask = await Task.findOne({ _id: subtaskId, user: userId });
        if (!subtask) {
            return { error: 'Subtask not found', status: 404 };
        }

        const parent = await Task.findOne({ _id: parentId, user: userId });

        if (!parent) {
            return { error: 'Parent task not found', status: 404 };
        }

        if (subtask.parentTask.toString() !== parentId) {
            return {
                error: 'Subtask does not belong to the specified parent',
                status: 400,
            };
        }

        // Remove subtask from its current position
        parent.subtasks = parent.subtasks.filter(
            (id: mongoose.Types.ObjectId) => id.toString() !== subtaskId
        );

        // Add subtask to the new position
        parent.subtasks.splice(newIndex, 0, subtaskId);
        await parent.save();

        return {
            updatedParent: parent,
            movedSubtask: subtask,
        };
    } catch (error) {
        if (
            error instanceof mongoose.Error.VersionError &&
            retryCount < MAX_RETRIES
        ) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return moveSubtask(
                userId,
                subtaskId,
                parentId,
                newIndex,
                retryCount + 1
            );
        }
        throw error;
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const { subtaskId, parentId, newIndex } = await req.json();

        const result = await moveSubtask(userId, subtaskId, parentId, newIndex);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: result.status }
            );
        }

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Error moving subtask:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
