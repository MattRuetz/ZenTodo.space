import dbConnect from '@/lib/mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import Task from '@/models/Task';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);
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
            dueDate,
            originalTempId,
        } = body;

        // **Task limit check**
        const taskCount = await Task.countDocuments({ user: userId, space });

        if (taskCount >= 50) {
            return NextResponse.json(
                {
                    error: 'Task limit reached. You cannot create more than 50 tasks in this space.',
                },
                { status: 400 }
            );
        }

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
            dueDate: dueDate,
            originalTempId: originalTempId,
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
                originalTempId: body.originalTempId,
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
