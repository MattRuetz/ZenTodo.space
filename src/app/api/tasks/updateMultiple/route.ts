import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { ObjectId } from 'mongodb';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const { tasks } = await req.json();

        if (!Array.isArray(tasks) || tasks.length === 0) {
            return NextResponse.json(
                { message: 'Invalid tasks data' },
                { status: 400 }
            );
        }

        const updateOperations = tasks.map((task) => ({
            updateOne: {
                filter: { _id: new ObjectId(task._id) },
                update: { $set: { x: task.x, y: task.y } },
            },
        }));

        const result = await Task.bulkWrite(updateOperations);

        if (result.modifiedCount === tasks.length) {
            return NextResponse.json(
                {
                    message: 'Tasks updated successfully',
                    updatedTasks: tasks,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { message: 'Some tasks could not be updated' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error updating tasks:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
