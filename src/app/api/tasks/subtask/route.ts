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
            position,
        } = body;

        const newTask = new Task({
            taskName: taskName,
            taskDescription: taskDescription,
            x: x,
            y: y,
            progress: progress,
            space: space,
            user: userId,
            zIndex: zIndex,
            parentTask: parentTask,
            subtasks: [],
            ancestors: ancestors,
        });

        let updateOperation;
        if (position === 'start') {
            updateOperation = {
                $push: {
                    subtasks: {
                        $each: [newTask._id],
                        $position: 0,
                    },
                },
            };
        } else if (position.startsWith('after_')) {
            const afterId = position.split('_')[1];
            const parentTaskDoc = await Task.findById(parentTask);
            if (!parentTaskDoc) {
                throw new Error('Parent task not found');
            }
            const index = parentTaskDoc.subtasks.findIndex(
                (id: string) => id.toString() === afterId
            );
            if (index === -1) {
                // If the afterId is not found, append to the end
                updateOperation = {
                    $push: { subtasks: newTask._id },
                };
            } else {
                updateOperation = {
                    $push: {
                        subtasks: {
                            $each: [newTask._id],
                            $position: index + 1,
                        },
                    },
                };
            }
        } else {
            updateOperation = {
                $push: { subtasks: newTask._id },
            };
        }

        const updatedParentTask = await Task.findByIdAndUpdate(
            parentTask,
            updateOperation,
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
        console.error('Error adding new subtask:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
