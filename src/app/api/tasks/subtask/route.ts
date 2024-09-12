import dbConnect from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import Task from '@/models/Task';
import Space from '@/models/Space';

async function getUserId(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error('Unauthorized');
    }
    return session.user.id;
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
            parentTask,
            ancestors,
            zIndex,
            index,
        } = body;

        // Get the current maxZIndex for the space and increment it

        const newTask = new Task({
            taskName: taskName,
            taskDescription: taskDescription,
            x: x,
            y: y,
            progress: progress,
            space: space,
            user: userId,
            zIndex: zIndex, // Set the zIndex here
            parentTask: parentTask,
            subtasks: [],
            ancestors: ancestors,
        });

        const updatedParentTask = await Task.findByIdAndUpdate(
            parentTask,
            {
                $push: {
                    subtasks: {
                        $each: [newTask._id],
                        $position: index,
                    },
                },
            },
            { new: true }
        );

        const savedTask = await newTask.save();

        return NextResponse.json(
            {
                newSubtask: savedTask,
                updatedParentTask: updatedParentTask,
            },
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
