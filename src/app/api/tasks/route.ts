import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Space from '@/models/Space'; // Assuming Space model is imported
import mongoose from 'mongoose';

async function getUserId(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
}

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
        const { taskName, taskDescription, x, y, progress, space } = body;

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
        });

        const savedTask = await newTask.save();

        // Update the space's maxZIndex
        await Space.findByIdAndUpdate(space, { maxZIndex: newZIndex });

        return NextResponse.json({ task: savedTask }, { status: 201 });
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

        console.log('updateData', updateData);
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
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const url = new URL(req.url);
        const taskId = url.searchParams.get('id');

        if (!taskId) {
            return NextResponse.json(
                { error: 'Task ID is required' },
                { status: 400 }
            );
        }

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
                    { error: 'Task not found or unauthorized' },
                    { status: 404 }
                );
            }

            // Recursively delete all subtasks
            const deleteSubtasks = async (
                taskId: mongoose.Types.ObjectId
            ): Promise<void> => {
                const subtasks = await Task.find({
                    parentTask: taskId,
                }).session(session);
                for (const subtask of subtasks) {
                    await deleteSubtasks(subtask._id);
                    await subtask.deleteOne({ session });
                }
            };

            await deleteSubtasks(task._id);
            await task.deleteOne({ session });

            await session.commitTransaction();
            return NextResponse.json(
                { message: 'Task and all subtasks deleted successfully' },
                { status: 200 }
            );
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}
