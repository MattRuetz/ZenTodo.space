import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getAuth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);
        const body = await req.json();
        const tasks = body.tasks;

        if (!tasks || !Array.isArray(tasks)) {
            return NextResponse.json(
                { error: 'Invalid tasks data' },
                { status: 400 }
            );
        }

        // **Task limit check**
        // Collect spaces involved
        const spacesInvolved = new Set<string>();
        tasks.forEach((task: any) => {
            if (task.space) {
                spacesInvolved.add(task.space);
            }
        });

        // Check task limits for each space
        for (const spaceId of Array.from(spacesInvolved)) {
            const tasksInSpace = tasks.filter(
                (task: any) => task.space === spaceId
            );
            const existingTaskCount = await Task.countDocuments({
                user: userId,
                space: spaceId,
            });
            const totalTasksAfterDuplication =
                existingTaskCount + tasksInSpace.length;

            if (totalTasksAfterDuplication > 50) {
                return NextResponse.json(
                    {
                        error: `Task limit reached in space ${spaceId}. Cannot duplicate tasks because it would exceed the limit of 50 tasks in the space.`,
                    },
                    { status: 400 }
                );
            }
        }

        const tempIdToObjectIdMap = new Map<string, mongoose.Types.ObjectId>();
        const duplicatedTasks: any[] = [];

        const generateNewObjectId = (tempId: string) => {
            if (!tempIdToObjectIdMap.has(tempId)) {
                tempIdToObjectIdMap.set(tempId, new mongoose.Types.ObjectId());
            }
            return tempIdToObjectIdMap.get(tempId);
        };

        const duplicateTask = async (taskData: any): Promise<any> => {
            const newTaskId = generateNewObjectId(taskData._id);
            const parentId = taskData.parentTask
                ? generateNewObjectId(taskData.parentTask)
                : undefined;

            const newTask = new Task({
                ...taskData,
                originalTempId: taskData._id,
                x: taskData.x,
                y: taskData.y,
                zIndex: taskData.zIndex + 1,
                _id: newTaskId, // Use the new ObjectId
                taskName: `${taskData.taskName}`,
                user: userId,
                parentTask: parentId,
                ancestors: taskData.ancestors.map((ancestorId: string) =>
                    generateNewObjectId(ancestorId)
                ),
                subtasks: [], // Initialize with an empty array, we'll populate it later
            });

            await newTask.save();
            duplicatedTasks.push(newTask);

            // Recursively duplicate subtasks
            const subtasks = tasks.filter(
                (task) => task.parentTask === taskData._id
            );
            for (const subtask of subtasks) {
                const duplicatedSubtask = await duplicateTask(subtask);
                newTask.subtasks.push(duplicatedSubtask._id);
            }

            // Update the newTask with the duplicated subtasks
            if (newTask.subtasks.length > 0) {
                await newTask.save();
            }

            return newTask;
        };

        // Process all tasks
        for (const task of tasks) {
            // Only process the main parent task
            // We'll duplicate the subtasks in the recursive function
            if (!task.parentTask) {
                await duplicateTask(task);
            }
        }

        return NextResponse.json({ tasks: duplicatedTasks }, { status: 201 });
    } catch (error) {
        console.error('Error duplicating tasks:', error);
        return NextResponse.json(
            { error: 'Failed to duplicate tasks' },
            { status: 500 }
        );
    }
}
