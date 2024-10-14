import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

const MAX_RETRIES = 10;
const INITIAL_BACKOFF = 100; // ms

export async function PUT(req: NextRequest) {
    let retries = 0;
    let requestBody: any;

    try {
        requestBody = await req.json();
    } catch (error) {
        console.error('Error parsing request body:', error);
        return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
        );
    }

    while (retries < MAX_RETRIES) {
        try {
            await dbConnect();
            const userId = await getUserIdFromClerk(req);

            if (!userId) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            const {
                subtaskIdString,
                parentTaskIdString,
                oldParentTaskIdString,
                x,
                y,
                zIndex,
            } = requestBody;
            const subtaskId = new ObjectId(subtaskIdString);
            const parentTaskId = parentTaskIdString
                ? new ObjectId(parentTaskIdString)
                : null;
            const oldParentTaskId = oldParentTaskIdString
                ? new ObjectId(oldParentTaskIdString)
                : null;

            // Fetch all necessary documents
            const [subtask, parentTask, oldParentTask] = await Promise.all([
                Task.findById(subtaskId),
                parentTaskId ? Task.findById(parentTaskId) : null,
                oldParentTaskId ? Task.findById(oldParentTaskId) : null,
            ]);

            if (!subtask) {
                throw new Error('Subtask not found');
            }

            // Prepare updates
            const updates = [];

            // Update old parent task
            if (oldParentTask) {
                oldParentTask.subtasks = oldParentTask.subtasks.filter(
                    (id: ObjectId) => id.toString() !== subtaskId.toString()
                );
                updates.push(oldParentTask.save());
            }

            // Update new parent task
            if (parentTask) {
                if (!parentTask.subtasks.includes(subtaskId)) {
                    parentTask.subtasks.push(subtaskId);
                }
                updates.push(parentTask.save());
            }

            // Update subtask
            subtask.parentTask = parentTaskId;
            subtask.ancestors = parentTaskId
                ? [...(parentTask?.ancestors || []), parentTaskId]
                : [];

            if (!parentTaskId && x !== undefined && y !== undefined) {
                subtask.zIndex = zIndex;
                subtask.x = x;
                subtask.y = y;
            }
            updates.push(subtask.save());

            // Update descendants
            const descendants = await Task.find({ ancestors: subtaskId });
            for (const descendant of descendants) {
                const updatedAncestors = parentTaskId
                    ? [
                          ...subtask.ancestors,
                          ...descendant.ancestors.slice(
                              descendant.ancestors.indexOf(subtaskId)
                          ),
                      ]
                    : descendant.ancestors.slice(
                          descendant.ancestors.indexOf(subtaskId)
                      );
                descendant.ancestors = updatedAncestors;
                updates.push(descendant.save());
            }

            // Execute all updates
            await Promise.all(updates);

            return NextResponse.json({
                updatedOldParentTask: oldParentTask?.toObject(),
                updatedNewParentTask: parentTask?.toObject(),
                updatedSubtask: subtask.toObject(),
                descendantsUpdated: descendants.length,
            });
        } catch (error) {
            if (
                error instanceof mongoose.mongo.MongoServerError &&
                error.message.includes('transaction number')
            ) {
                retries++;
                if (retries >= MAX_RETRIES) {
                    console.error('Max retries reached. Operation failed.');
                    return NextResponse.json(
                        { error: 'Internal Server Error' },
                        { status: 500 }
                    );
                }
                console.log(`Retry attempt ${retries}`);
                await new Promise((resolve) =>
                    setTimeout(resolve, INITIAL_BACKOFF * Math.pow(2, retries))
                );
            } else {
                console.error('Error updating task hierarchy:', error);
                return NextResponse.json(
                    { error: 'Internal Server Error' },
                    { status: 500 }
                );
            }
        }
    }
}
