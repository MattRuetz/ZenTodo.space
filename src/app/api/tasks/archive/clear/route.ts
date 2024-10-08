import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);

        const result = await Task.deleteMany({
            user: userId,
            isArchived: true,
        });

        if (result.deletedCount > 0) {
            return NextResponse.json({
                message: `${result.deletedCount} archived tasks deleted successfully`,
            });
        } else {
            return NextResponse.json(
                { message: 'No archived tasks found to delete' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error clearing archived tasks:', error);
        return NextResponse.json(
            { error: 'Failed to clear archived tasks' },
            { status: 500 }
        );
    }
}
