import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';
import mongoose from 'mongoose';

const MAX_RETRIES = 3;
const RETRY_DELAY = 100; // milliseconds

// async function moveSubtask(
//     userId: string,
//     subtaskId: string,
//     parentId: string,
//     newIndex: number,
//     retryCount = 0
// ): Promise<any> {
//     try {
//         const subtask = await Task.findOne({ _id: subtaskId, user: userId });
//         if (!subtask) {
//             return { error: 'Subtask not found', status: 404 };
//         }

//         const parent = await Task.findOne({ _id: parentId, user: userId });

//         if (!parent) {
//             return { error: 'Parent task not found', status: 404 };
//         }

//         if (subtask.parentTask.toString() !== parentId) {
//             return {
//                 error: 'Subtask does not belong to the specified parent',
//                 status: 400,
//             };
//         }

//         // Remove subtask from its current position
//         parent.subtasks = parent.subtasks.filter(
//             (id: mongoose.Types.ObjectId) => id.toString() !== subtaskId
//         );

//         // Add subtask to the new position
//         parent.subtasks.splice(newIndex, 0, subtaskId);
//         await parent.save();

//         return {
//             updatedParent: parent,
//             movedSubtask: subtask,
//         };
//     } catch (error) {
//         if (
//             error instanceof mongoose.Error.VersionError &&
//             retryCount < MAX_RETRIES
//         ) {
//             await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
//             return moveSubtask(
//                 userId,
//                 subtaskId,
//                 parentId,
//                 newIndex,
//                 retryCount + 1
//             );
//         }
//         throw error;
//     }
// }

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const body = await req.json();
        const { subtaskId, parentId, newIndex } = body;

        const parentTask = await Task.findOne({ _id: parentId, user: userId });
        if (!parentTask) {
            return NextResponse.json(
                { error: 'Parent task not found' },
                { status: 404 }
            );
        }

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
        parentTask.subtasks.splice(newIndex, 0, subtaskId);

        await parentTask.save();

        const movedSubtask = await Task.findById(subtaskId);

        return NextResponse.json({
            updatedParent: parentTask,
            movedSubtask: movedSubtask,
        });
    } catch (error) {
        console.error('Error moving subtask:', error);
        return NextResponse.json(
            { error: 'Failed to move subtask' },
            { status: 500 }
        );
    }
}
