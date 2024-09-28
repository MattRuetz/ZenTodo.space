import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';
import mongoose from 'mongoose';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const { taskId } = await req.json();

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const task = await Task.findOne({
                _id: taskId,
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
            const updatedTasks = await archiveTaskAndDescendants(task, session);

            await session.commitTransaction();

            return NextResponse.json({ tasks: updatedTasks });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error archiving task:', error);
        return NextResponse.json(
            { error: 'Failed to archive task' },
            { status: 500 }
        );
    }
}

async function archiveTaskAndDescendants(
    task: any,
    session: mongoose.ClientSession
): Promise<any[]> {
    const updateData = {
        space: null,
        isArchived: true,
        archivedAt: new Date(),
        subtasks: [],
        ancestors: [],
        parentTask: null,
    };

    const updatedTask = await Task.findByIdAndUpdate(task._id, updateData, {
        new: true,
        session,
    });

    let updatedTasks = [updatedTask];

    if (task.subtasks && task.subtasks.length > 0) {
        for (const subtaskId of task.subtasks) {
            const subtask = await Task.findById(subtaskId).session(session);
            if (subtask) {
                const subtaskUpdates = await archiveTaskAndDescendants(
                    subtask,
                    session
                );
                updatedTasks = updatedTasks.concat(subtaskUpdates);
            }
        }
    }

    return updatedTasks;
}
