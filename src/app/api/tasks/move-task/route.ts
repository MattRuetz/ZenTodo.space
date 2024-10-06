import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import Space from '@/models/Space';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);
        const body = await req.json();
        const { parentId, newOrder, spaceId } = body;

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
