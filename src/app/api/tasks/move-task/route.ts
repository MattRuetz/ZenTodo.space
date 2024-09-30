import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserId } from '@/hooks/useGetUserId';
import { space } from 'postcss/lib/list';
import Space from '@/models/Space';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserId(req);
        const body = await req.json();
        const { parentId, newOrder, spaceId } = body;

        console.log(
            'Received request to move tasks for parent:',
            parentId,
            'with new order:',
            newOrder,
            'in space:',
            spaceId
        );

        if (parentId) {
            // Moving within a parent task
            const parentTask = await Task.findOne({
                _id: parentId,
                user: userId,
            });
            if (!parentTask) {
                console.log('Parent task not found:', parentId);
                return NextResponse.json(
                    { error: 'Parent task not found' },
                    { status: 404 }
                );
            }

            parentTask.subtasks = newOrder;
            await parentTask.save();
            console.log('Parent task updated:', parentTask);

            // Update all subtasks to ensure their parentTask field is correct
            await Task.updateMany(
                { _id: { $in: newOrder } },
                { $set: { parentTask: parentId } }
            );
        } else {
            // Moving at the root level
            // Update the order of tasks within the space
            const space = await Space.findOne({ _id: spaceId, userId: userId });
            if (!space) {
                console.log('Space not found:', spaceId, userId);
                return NextResponse.json(
                    { error: 'Space not found' },
                    { status: 404 }
                );
            }
            space.taskOrder = newOrder;
            await space.save();
            console.log('Root tasks updated for space:', spaceId);
        }

        return NextResponse.json({
            newOrder: newOrder,
            parentId: parentId,
            spaceId: spaceId,
        });
    } catch (error) {
        console.error('Error moving task:', error);
        return NextResponse.json(
            { error: 'Failed to move task' },
            { status: 500 }
        );
    }
}
