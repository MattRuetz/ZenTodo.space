import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcrypt';
import sharp from 'sharp';
import { getUserIdFromClerk } from '@/app/utils/getUserIdFromClerk';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const userId = await getUserIdFromClerk(req);
        const updateData = await req.json();

        // If password is being updated, hash it
        if (updateData.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
            new: true,
        }).select('-password');

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        return NextResponse.json(
            { error: 'Failed to update profile picture' },
            { status: 500 }
        );
    }
}
