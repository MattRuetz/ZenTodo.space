// Add this file if it doesn't exist
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Space from '@/models/Space';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await User.findOne({ clerkId: userId });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Calculate stats
        const spacesCount = await Space.countDocuments({ userId: userId });
        const totalTasksCreated = await Task.countDocuments({ user: userId });
        const tasksCompleted = await Task.countDocuments({
            user: userId,
            progress: 'Complete',
        });
        const tasksInProgress = await Task.countDocuments({
            user: userId,
            progress: 'In Progress',
        });

        // Update user stats
        user.spacesCount = spacesCount;
        user.totalTasksCreated = totalTasksCreated;
        user.tasksCompleted = tasksCompleted;
        user.tasksInProgress = tasksInProgress;
        await user.save();

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
        );
    }
}
