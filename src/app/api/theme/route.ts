import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { theme } = await req.json();

        if (!['buji', 'daigo', 'enzu'].includes(theme)) {
            return NextResponse.json(
                { error: 'Invalid theme' },
                { status: 400 }
            );
        }

        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { themePreference: theme },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ theme: updatedUser.themePreference });
    } catch (error) {
        console.error('Error updating theme:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const user = await User.findById(session.user.id);

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ themePreference: user.themePreference });
    } catch (error) {
        console.error('Error fetching theme preference:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
