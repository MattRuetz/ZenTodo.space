import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { subtaskIdString, parentTaskIdString } = await req.json();
        const subtaskId = new ObjectId(subtaskIdString);
        const parentTaskId = new ObjectId(parentTaskIdString);

        const [parentTask, subtask] = await Promise.all([
            Task.findById(parentTaskId),
            Task.findById(subtaskId),
        ]);

        if (!parentTask || !subtask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Update parent task
        if (!Array.isArray(parentTask.subtasks)) {
            parentTask.subtasks = [];
        }
        if (!parentTask.subtasks.includes(subtaskId)) {
            parentTask.subtasks.push(subtaskId);
        }

        // Update subtask
        subtask.parentTask = parentTaskId;

        // Save both tasks
        await Promise.all([parentTask.save(), subtask.save()]);

        return NextResponse.json({
            updatedParentTask: parentTask.toObject(),
            updatedSubtask: subtask.toObject(),
        });
    } catch (error) {
        console.error('Error updating task hierarchy:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
