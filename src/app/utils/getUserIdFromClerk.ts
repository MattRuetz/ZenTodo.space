// src/utils/getUserIdFromClerk.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import User from '@/models/User';

const userCache = new Map<string, string>(); // Cache for userId by clerkId

export async function getUserIdFromClerk(
    req: NextRequest
): Promise<string | undefined> {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) {
        return undefined;
    }

    // Check if userId is cached
    let userId = userCache.get(clerkId);
    if (!userId) {
        const user = await User.findOne({ clerkId });
        if (!user) {
            return undefined; // Return null if user is not found
        }
        userId = user._id.toString(); // Convert ObjectId to string
        userCache.set(clerkId, userId as string); // Cache the userId
    }

    return userId; // Return the userId
}
