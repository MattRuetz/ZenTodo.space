// src/app/api/tasks/deleteOldArchivedTasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const twentySecondsAgo = new Date();
        twentySecondsAgo.setSeconds(twentySecondsAgo.getSeconds() - 20);

        const result = await Task.deleteMany({
            isArchived: true,
            archivedAt: { $lt: twentySecondsAgo },
        });

        return NextResponse.json(
            { deletedCount: result.deletedCount },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting old archived tasks:', error);
        return NextResponse.json(
            { error: 'Failed to delete old archived tasks' },
            { status: 500 }
        );
    }
}
