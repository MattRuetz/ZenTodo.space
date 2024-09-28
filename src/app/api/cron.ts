// src/app/api/cron.ts
import { NextRequest, NextResponse } from 'next/server';
import { deleteOldArchivedTasks } from './tasks/deleteOldArchivedTasks';

export async function GET(req: NextRequest) {
    if (
        req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const result = await deleteOldArchivedTasks(req);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
    }
}

export const config = {
    runtime: 'edge',
};
