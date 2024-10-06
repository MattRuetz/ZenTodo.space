// src/app/api/tasks/[id]/move/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import mongoose from 'mongoose';
import { getAuth } from '@clerk/nextjs/server';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);
        const { spaceId } = await req.json();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const task = await Task.findOne({
                _id: params.id,
                user: userId,
            }).session(session);

            if (!task) {
                await session.abortTransaction();
                return NextResponse.json(
                    { error: 'Task not found' },
                    { status: 404 }
                );
            }

            // Update the task and all its descendants
            const updatedTasks = await updateTaskAndDescendants(
                task._id,
                spaceId,
                session
            );

            await session.commitTransaction();

            return NextResponse.json({ tasks: updatedTasks });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error moving or archiving task:', error);
        return NextResponse.json(
            { error: 'Failed to move or archive task' },
            { status: 500 }
        );
    }
}

async function updateTaskAndDescendants(
    taskId: string,
    spaceId: string | null,
    session: mongoose.ClientSession
): Promise<any[]> {
    const isArchiving = spaceId === null;
    const updateData = isArchiving
        ? { space: null, isArchived: true, archivedAt: new Date() }
        : { space: spaceId, isArchived: false, archivedAt: null };

    const task = await Task.findByIdAndUpdate(taskId, updateData, {
        new: true,
        session,
    });

    let updatedTasks = [task];

    if (task && task.subtasks && task.subtasks.length > 0) {
        for (const subtaskId of task.subtasks) {
            const subtaskUpdates = await updateTaskAndDescendants(
                subtaskId,
                spaceId,
                session
            );
            updatedTasks = updatedTasks.concat(subtaskUpdates);
        }
    }

    return updatedTasks;
}
