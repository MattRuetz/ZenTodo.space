// src/app/api/tasks/deleteOldArchivedTasks/route.ts
import { NextRequest } from 'next/server';
import { deleteOldArchivedTasks } from '../deleteOldArchivedTasks';

export async function GET(req: NextRequest) {
    console.log('Cron job executed at:', new Date().toISOString());
    return deleteOldArchivedTasks(req);
}
