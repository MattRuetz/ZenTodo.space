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
        // Read the request body once
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

            const mongoSession = await mongoose.startSession();
            await mongoSession.withTransaction(async (session) => {
                const [parentTask, subtask, oldParentTask] = await Promise.all([
                    parentTaskId
                        ? Task.findById(parentTaskId).session(session)
                        : null,
                    Task.findById(subtaskId).session(session),
                    oldParentTaskId
                        ? Task.findById(oldParentTaskId).session(session)
                        : null,
                ]);

                if (!subtask) {
                    throw new Error('Subtask not found');
                }

                // Remove subtask from previous parent if it exists
                if (oldParentTask) {
                    oldParentTask.subtasks = oldParentTask.subtasks.filter(
                        (id: ObjectId) => id.toString() !== subtaskId.toString()
                    );
                    await oldParentTask.save({ session });
                }

                // Update NEW parent task if it exists
                if (parentTask) {
                    if (!parentTask.subtasks.includes(subtaskId)) {
                        parentTask.subtasks.push(subtaskId);
                    }
                    await parentTask.save({ session });
                }

                // Update subtask
                subtask.parentTask = parentTaskId;
                subtask.ancestors = parentTaskId
                    ? [...(parentTask?.ancestors || []), parentTaskId]
                    : [];

                // If converting to top-level task, update x and y and zIndex
                if (!parentTaskId && x !== undefined && y !== undefined) {
                    subtask.zIndex = zIndex;
                    subtask.x = x;
                    subtask.y = y;
                }

                await subtask.save({ session });

                // Update all descendants of the subtask
                const descendants = await Task.find({
                    ancestors: subtaskId,
                }).session(session);

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
                    await Task.findByIdAndUpdate(
                        descendant._id,
                        { $set: { ancestors: updatedAncestors } },
                        { session }
                    );
                }

                return {
                    updatedOldParentTask: oldParentTask?.toObject(),
                    updatedNewParentTask: parentTask?.toObject(),
                    updatedSubtask: subtask.toObject(),
                    descendantsUpdated: descendants.length,
                };
            });

            const result = await mongoSession.commitTransaction();
            mongoSession.endSession();

            return NextResponse.json(result);
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
