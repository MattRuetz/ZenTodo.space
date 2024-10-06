// src/app/api/tasks/space/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Task from '@/models/Task';
import mongoose from 'mongoose';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function DELETE(req: NextRequest) {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await dbConnect();
            const userId = await getUserIdFromClerk(req);
            const url = new URL(req.url);
            const spaceId = url.searchParams.get('spaceId');

            if (!spaceId) {
                return NextResponse.json(
                    { error: 'Space ID is required' },
                    { status: 400 }
                );
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                // Delete all tasks in the space
                const result = await Task.deleteMany({
                    space: spaceId,
                    user: userId,
                }).session(session);

                await session.commitTransaction();
                return NextResponse.json(
                    { deletedCount: result.deletedCount },
                    { status: 200 }
                );
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }
        } catch (error) {
            if (error instanceof Error && error.message === 'Unauthorized') {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }

            if (
                error instanceof mongoose.mongo.MongoServerError &&
                error.code === 11000
            ) {
                retries++;
                if (retries >= maxRetries) {
                    console.error(
                        'Max retries reached. Delete operation failed.'
                    );
                    return NextResponse.json(
                        {
                            error: 'Failed to delete tasks after multiple attempts',
                        },
                        { status: 500 }
                    );
                }
                console.log(`Retry attempt ${retries} for delete operation`);
                await new Promise((resolve) =>
                    setTimeout(resolve, 100 * Math.pow(2, retries))
                );
            } else {
                console.error('Error deleting tasks:', error);
                return NextResponse.json(
                    { error: 'Failed to delete tasks' },
                    { status: 500 }
                );
            }
        }
    }
}
