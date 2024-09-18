import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const body = await req.json();
        const { subtaskId, parentId, newPosition, newOrder } = body;

        const parentTask = await Task.findOne({ _id: parentId, user: userId });
        if (!parentTask) {
            return NextResponse.json(
                { error: 'Parent task not found' },
                { status: 404 }
            );
        }

        if (newOrder) {
            // Update the order based on the provided newOrder
            parentTask.subtasks = newOrder;
        } else {
            // Existing logic for moving a single subtask
            const subtaskIndex = parentTask.subtasks.indexOf(subtaskId);
            if (subtaskIndex === -1) {
                return NextResponse.json(
                    { error: 'Subtask not found in parent task' },
                    { status: 404 }
                );
            }

            // Remove subtask from its current position
            parentTask.subtasks.splice(subtaskIndex, 1);
            // Insert subtask at the new position
            if (newPosition === 'start') {
                parentTask.subtasks.unshift(subtaskId);
            } else if (newPosition.startsWith('after_')) {
                const afterId = newPosition.split('_')[1];
                const afterIndex = parentTask.subtasks.indexOf(afterId);
                if (afterIndex !== -1) {
                    parentTask.subtasks.splice(afterIndex + 1, 0, subtaskId);
                } else {
                    parentTask.subtasks.push(subtaskId);
                }
            } else {
                parentTask.subtasks.push(subtaskId);
            }
        }

        await parentTask.save();

        return NextResponse.json({
            updatedParent: parentTask,
        });
    } catch (error) {
        console.error('Error moving subtask:', error);
        return NextResponse.json(
            { error: 'Failed to move subtask' },
            { status: 500 }
        );
    }
}
