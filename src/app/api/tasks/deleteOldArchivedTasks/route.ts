// src/app/api/tasks/deleteOldArchivedTasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteOldArchivedTasks } from '../deleteOldArchivedTasks';

// export async function GET(req: NextRequest) {
//     return deleteOldArchivedTasks(req);
// }

export async function GET(req: NextRequest) {
    try {
        console.log('CRON job started at:', new Date().toISOString());
        // Rest of your code...
        return new NextResponse('CRON job executed', { status: 200 });
    } catch (error) {
        console.error('Error in CRON job:', error);
        return new NextResponse('Error in CRON job', { status: 500 });
    }
}
