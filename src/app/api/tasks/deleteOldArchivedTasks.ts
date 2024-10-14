// src/app/api/tasks/deleteOldArchivedTasks.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';

export async function deleteOldArchivedTasks(req: NextRequest) {
    try {
        await dbConnect();

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Task.deleteMany({
            isArchived: true,
            archivedAt: { $lt: thirtyDaysAgo },
        });

        return NextResponse.json(
            { deletedCount: result.deletedCount },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to delete old archived tasks' },
            { status: 500 }
        );
    }
}
