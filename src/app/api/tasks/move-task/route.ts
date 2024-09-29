import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Space from '@/models/Space'; // Assuming you have a Space model
import { getUserId } from '@/hooks/useGetUserId';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const body = await req.json();
        const { taskId, parentId, newPosition, newOrder, spaceId } = body;

        const task = await Task.findOne({ _id: taskId, user: userId });
        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        if (parentId) {
            // Moving within a parent task
            const parentTask = await Task.findOne({
                _id: parentId,
                user: userId,
            });
            if (!parentTask) {
                return NextResponse.json(
                    { error: 'Parent task not found' },
                    { status: 404 }
                );
            }

            if (newOrder) {
                // Update the order based on the provided newOrder
                parentTask.subtasks = newOrder;
            } else {
                // Existing logic for moving a single task within a parent
                const taskIndex = parentTask.subtasks.indexOf(taskId);
                if (taskIndex !== -1) {
                    parentTask.subtasks.splice(taskIndex, 1);
                }

                if (newPosition === 'start') {
                    parentTask.subtasks.unshift(taskId);
                } else if (newPosition.startsWith('after_')) {
                    const afterId = newPosition.split('_')[1];
                    const afterIndex = parentTask.subtasks.indexOf(afterId);
                    if (afterIndex !== -1) {
                        parentTask.subtasks.splice(afterIndex + 1, 0, taskId);
                    } else {
                        parentTask.subtasks.push(taskId);
                    }
                } else {
                    parentTask.subtasks.push(taskId);
                }
            }

            task.parentTask = parentId;
            await parentTask.save();
        } else {
            // Moving at the root level
            if (!spaceId) {
                return NextResponse.json(
                    { error: 'Space ID is required for root-level tasks' },
                    { status: 400 }
                );
            }

            const space = await Space.findOne({ _id: spaceId, user: userId });
            if (!space) {
                return NextResponse.json(
                    { error: 'Space not found' },
                    { status: 404 }
                );
            }

            if (newOrder) {
                // Update the order based on the provided newOrder
                space.taskOrder = newOrder;
            } else {
                // Existing logic for moving a single task at root level
                const taskIndex = space.taskOrder.indexOf(taskId);
                if (taskIndex !== -1) {
                    space.taskOrder.splice(taskIndex, 1);
                }

                if (newPosition === 'start') {
                    space.taskOrder.unshift(taskId);
                } else if (newPosition.startsWith('after_')) {
                    const afterId = newPosition.split('_')[1];
                    const afterIndex = space.taskOrder.indexOf(afterId);
                    if (afterIndex !== -1) {
                        space.taskOrder.splice(afterIndex + 1, 0, taskId);
                    } else {
                        space.taskOrder.push(taskId);
                    }
                } else {
                    space.taskOrder.push(taskId);
                }
            }

            task.parentTask = null;
            await space.save();
        }

        await task.save();

        return NextResponse.json({
            updatedTask: task,
            newOrder: parentId
                ? (await Task.findById(parentId)).subtasks
                : (await Space.findById(spaceId)).taskOrder,
            parentId: parentId,
        });
    } catch (error) {
        console.error('Error moving task:', error);
        return NextResponse.json(
            { error: 'Failed to move task' },
            { status: 500 }
        );
    }
}
