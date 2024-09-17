import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import mongoose from 'mongoose';
import { getUserId } from '@/hooks/useGetUserId';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const body = await req.json();
        const tasks = body.tasks;

        if (!tasks || !Array.isArray(tasks)) {
            return NextResponse.json(
                { error: 'Invalid tasks data' },
                { status: 400 }
            );
        }

        const tempIdToObjectIdMap = new Map<string, mongoose.Types.ObjectId>();
        const duplicatedTasks: any[] = [];

        const generateNewObjectId = (tempId: string) => {
            if (!tempIdToObjectIdMap.has(tempId)) {
                tempIdToObjectIdMap.set(tempId, new mongoose.Types.ObjectId());
            }
            return tempIdToObjectIdMap.get(tempId);
        };

        const duplicateTask = async (
            taskData: any,
            parentId?: mongoose.Types.ObjectId,
            ancestors: mongoose.Types.ObjectId[] = []
        ): Promise<any> => {
            const newTaskId = generateNewObjectId(taskData._id);
            const newTask = new Task({
                ...taskData,
                originalTempId: taskData._id,
                x: taskData.x,
                y: taskData.y,
                zIndex: taskData.zIndex + 3,
                _id: newTaskId, // Use the new ObjectId
                taskName: `${taskData.taskName}`,
                user: userId,
                parentTask: parentId,
                ancestors: parentId ? [...ancestors, parentId] : [],
                subtasks: [], // Initialize with an empty array, we'll populate it later
            });

            await newTask.save();
            duplicatedTasks.push(newTask);

            // Recursively duplicate subtasks
            const duplicatedSubtasks = [];
            for (const subtask of taskData.subtasks) {
                const subtaskObject =
                    typeof subtask === 'string'
                        ? await Task.findById(subtask)
                        : subtask;
                if (subtaskObject) {
                    const duplicatedSubtask = await duplicateTask(
                        subtaskObject,
                        newTask._id,
                        newTask.ancestors
                    );
                    duplicatedSubtasks.push(duplicatedSubtask._id);
                }
            }

            // Update the newTask with the duplicated subtasks
            if (duplicatedSubtasks.length > 0) {
                newTask.subtasks = duplicatedSubtasks;
                await newTask.save(); // Save the updated task with subtasks
            }

            return newTask;
        };

        // Only process top-level tasks
        const topLevelTasks = tasks.filter((task) => !task.parentTask);
        for (const task of topLevelTasks) {
            await duplicateTask(task);
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
