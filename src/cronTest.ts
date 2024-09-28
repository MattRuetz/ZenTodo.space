import cron from 'node-cron';
import { deleteOldArchivedTasks } from './app/api/tasks/deleteOldArchivedTasks';
import { NextRequest } from 'next/server';

// Simulate a NextRequest object
const mockRequest = {
    headers: {
        get: () => `Bearer ${process.env.CRON_SECRET}`,
    },
} as unknown as NextRequest;

// Schedule the cron job to run every minute for testing purposes
cron.schedule('* * * * *', async () => {
    console.log('Running cron job to delete old archived tasks...');
    try {
        const result = await deleteOldArchivedTasks(mockRequest);
        console.log('Cron job result:', result);
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});

console.log('Cron job scheduler started. Press Ctrl+C to exit.');
