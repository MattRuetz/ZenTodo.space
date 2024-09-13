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
            updateOperation = {
                $push: {
                    subtasks: {
                        $each: [newTask._id],
                        $position: {
                            $add: [
                                { $indexOfArray: ['$subtasks', afterId] },
                                1,
                            ],
                        },
                    },
                },
            };
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
