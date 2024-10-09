// src/app/api/tasks/[id]/position/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const { x, y, zIndex } = await req.json();
    const { id } = params;

    await dbConnect();

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { $set: { x, y, zIndex } },
            { new: true, runValidators: true }
        );

        if (!updatedTask) {
            return NextResponse.json(
                { message: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                position: {
                    x: updatedTask.x,
                    y: updatedTask.y,
                    zIndex: updatedTask.zIndex,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message },
            { status: 400 }
        );
    }
}
