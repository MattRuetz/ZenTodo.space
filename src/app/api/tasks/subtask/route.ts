import dbConnect from '@/lib/mongodb';
import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';

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
