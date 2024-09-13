import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';
import mongoose from 'mongoose';

const MAX_RETRIES = 3;
const RETRY_DELAY = 100;

async function moveSubtask(
    userId: string,
    subtaskId: string,
    newParentId: string,
    newPosition: string,
    retryCount = 0
): Promise<any> {
    try {
        const subtask = await Task.findOne({ _id: subtaskId, user: userId });
        if (!subtask) {
            return { error: 'Subtask not found', status: 404 };
        }

        const oldParentId = subtask.parentTask;
        const oldParent = await Task.findOne({
            _id: oldParentId,
            user: userId,
        });
        const newParent = await Task.findOne({
            _id: newParentId,
            user: userId,
        });

        if (!oldParent || !newParent) {
            return { error: 'Parent task not found', status: 404 };
        }

        // Remove subtask from old parent
        oldParent.subtasks = oldParent.subtasks.filter(
            (id: mongoose.Types.ObjectId) => id.toString() !== subtaskId
        );
        await oldParent.save();

        // Add subtask to new parent at the specified position
        if (newPosition === 'start') {
            newParent.subtasks.unshift(subtaskId);
        } else if (newPosition.startsWith('after_')) {
            const afterId = newPosition.split('_')[1];
            const index = newParent.subtasks.findIndex(
                (id: mongoose.Types.ObjectId) => id.toString() === afterId
            );
            if (index !== -1) {
                newParent.subtasks.splice(index + 1, 0, subtaskId);
            } else {
                newParent.subtasks.push(subtaskId);
            }
        } else {
            newParent.subtasks.push(subtaskId);
        }
        await newParent.save();

        // Update subtask's parent
        subtask.parentTask = newParentId;
        await subtask.save();

        return {
            updatedOldParent: oldParent,
            updatedNewParent: newParent,
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
                newParentId,
                newPosition,
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
        const { subtaskId, newParentId, newPosition } = await req.json();

        const result = await moveSubtask(
            userId,
            subtaskId,
            newParentId,
            newPosition
        );

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
