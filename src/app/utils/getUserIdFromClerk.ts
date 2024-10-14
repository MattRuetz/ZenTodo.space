// src/utils/getUserIdFromClerk.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import User from '@/models/User';

const userCache = new Map<string, string>();

export async function getUserIdFromClerk(
    req: NextRequest
): Promise<string | undefined> {
    const { userId: clerkId } = getAuth(req);

    if (!clerkId) {
        return undefined;
    }

    let userId = userCache.get(clerkId);
    if (!userId) {
        let user = await User.findOne({ clerkId });
        if (!user) {
            // Create a new user if not found
            user = new User({ clerkId });
            await user.save();
        }
        userId = user._id.toString();
        userCache.set(clerkId, userId as string);
    }

    return userId;
}
