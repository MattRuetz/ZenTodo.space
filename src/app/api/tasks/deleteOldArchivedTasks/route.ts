// src/app/api/tasks/deleteOldArchivedTasks/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteOldArchivedTasks } from '../deleteOldArchivedTasks';

// export async function GET(req: NextRequest) {
//     return deleteOldArchivedTasks(req);
// }

export async function GET(req: NextRequest) {
    console.log('Cron job executed at:', new Date().toISOString());
    return NextResponse.json({ message: 'Cron job executed' }, { status: 200 });
}
