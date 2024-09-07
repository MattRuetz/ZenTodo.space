import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

        const { subtaskId, parentTaskId } = await req.json();

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
        parentTask.subtasks.push(subtaskId);

        await Promise.all([subtask.save(), parentTask.save()]);

        // AI-assisted description update
        const updatedDescription = await updateTaskDescriptionWithAI(
            parentTask,
            subtask
        );
        parentTask.taskDescription = updatedDescription;
        await parentTask.save();

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

async function updateTaskDescriptionWithAI(parentTask: any, subtask: any) {
    const prompt = `
        Given the following parent task:
        Title: ${parentTask.taskName}
        Description: ${parentTask.taskDescription}

        And a new subtask:
        Title: ${subtask.taskName}
        Description: ${subtask.taskDescription}

        Please rewrite the parent task description to include mention of the subtask, ensuring the new description is concise and well-integrated.
    `;

    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
    });

    const content = response.choices[0]?.message?.content;
    return content ? content.trim() : '';
}
