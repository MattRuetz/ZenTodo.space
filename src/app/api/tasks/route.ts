import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Space from '@/models/Space'; // Assuming Space model is imported
import mongoose from 'mongoose';
import { getUserId } from '@/hooks/useGetUserId';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const tasks = await Task.find({ user: userId });
        return NextResponse.json({ tasks });
    } catch (error) {
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const body = await req.json();
        const {
            taskName,
            taskDescription,
            x,
            y,
            progress,
            space,
            dueDate,
            parentTask,
            ancestors,
            subtasks,
            emoji,
            tempId,
        } = body;

        // Get the current maxZIndex for the space and increment it
        const currentSpace = await Space.findById(space);
        const newZIndex = (currentSpace.maxZIndex || 0) + 1;

        const newTask = new Task({
            taskName,
            taskDescription,
            x,
            y,
            progress,
            space,
            user: userId,
            zIndex: newZIndex, // Set the zIndex here
            dueDate,
            parentTask: parentTask ?? undefined,
            ancestors: ancestors ?? [],
            subtasks: subtasks ?? [],
            emoji: emoji ?? '',
        });

        const savedTask = await newTask.save();

        // Update the space's maxZIndex
        if (space) {
            await Space.findByIdAndUpdate(space, { maxZIndex: newZIndex });
        }

        return NextResponse.json(
            { task: savedTask, originalTempId: tempId },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const body = await req.json();
        // updateData can allow for partial updates
        const { _id, ...updateData } = body;

        updateData.updatedAt = new Date();

        // console.log('updateData', updateData);
        const updatedTask = await Task.findOneAndUpdate(
            { _id: _id, user: userId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return NextResponse.json(
                { error: 'Task not found or unauthorized' },
                { status: 404 }
            );
        }

        return NextResponse.json({ task: updatedTask }, { status: 200 });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest) {
    const maxRetries = 5;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await dbConnect();
            const userId = await getUserId(req);
            const url = new URL(req.url);
            const taskId = url.searchParams.get('id');
            const parentTaskId = url.searchParams.get('parentId');
            console.log('taskId', taskId);
            console.log('parentTaskId', parentTaskId);

            if (!taskId) {
                return NextResponse.json(
                    { error: 'Task ID is required' },
                    { status: 400 }
                );
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Find the task and all its descendants in one query
                const tasksToDelete = await Task.find({
                    $or: [{ _id: taskId }, { ancestors: taskId }],
                    user: userId,
                }).session(session);

                if (tasksToDelete.length === 0) {
                    await session.abortTransaction();
                    return NextResponse.json(
                        { error: 'Task not found or unauthorized' },
                        { status: 404 }
                    );
                }

                // Remove the task from its parent's subtasks array
                if (parentTaskId) {
                    await Task.findByIdAndUpdate(
                        parentTaskId,
                        { $pull: { subtasks: taskId } },
                        { session }
                    );
                }

                // Delete all tasks in one operation
                await Task.deleteMany({
                    _id: { $in: tasksToDelete.map((task) => task._id) },
                }).session(session);

                await session.commitTransaction();
                return NextResponse.json(
                    {
                        deletedTaskIds: tasksToDelete.map((task) => task._id),
                        parentTaskId,
                    },
                    { status: 200 }
                );
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            // ... rest of the error handling remains the same
        }
    }
}
