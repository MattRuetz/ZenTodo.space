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

        console.log(subtaskId, parentTaskId);

        const [subtask, parentTask] = await Promise.all([
            Task.findById(subtaskId),
            Task.findById(parentTaskId),
        ]);

        if (!subtask || !parentTask) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        subtask.parentTask = parentTaskId;
        if (!Array.isArray(parentTask.subtasks)) {
            parentTask.subtasks = [];
        }
        parentTask.subtasks.push(subtaskId);

        await Promise.all([subtask.save(), parentTask.save()]);

        return NextResponse.json({
            updatedParentTask: parentTask,
            updatedSubtask: subtask,
        });
    } catch (error) {
        console.error('Error updating task hierarchy:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
