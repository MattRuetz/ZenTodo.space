import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const content = await req.json();
    const { id } = params; // This should correctly extract taskId

    console.log('content', content);
    console.log('id', id); // Check if taskId is logged correctly

    await dbConnect();

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { $set: content },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return NextResponse.json(
                { message: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ task: updatedTask }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}
