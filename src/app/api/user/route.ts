// Add this file if it doesn't exist
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Space from '@/models/Space';
import Task from '@/models/Task';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { userId: clerkId } = getAuth(req);
        if (!clerkId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await User.findOne({ clerkId });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Calculate LIVE stats (requires that we fetch the user when profile is loaded)
        const spacesCount = await Space.countDocuments({ userId: user._id });
        // const totalTasksCreated = await Task.countDocuments({ user: user._id });
        // const tasksCompleted = await Task.countDocuments({
        //     user: user._id,
        //     progress: 'Complete',
        // });
        const tasksInProgress = await Task.countDocuments({
            user: user._id,
            progress: 'In Progress',
        });

        // // Update user stats
        user.spacesCount = spacesCount;
        // user.totalTasksCreated = totalTasksCreated;
        // user.tasksCompleted = tasksCompleted;
        user.tasksInProgress = tasksInProgress;
        // await user.save();

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
        );
    }
}
