import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import resend from '@/lib/resend';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

        const { data, error } = await resend.emails.send({
            from: 'ZenTodo <noreply@zen-todo.com>',
            to: user.email,
            subject: 'Password Reset',
            html: `
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `,
        });

        if (error) {
            console.error('Error sending reset email:', error);
            return NextResponse.json(
                { message: 'Error sending reset email' },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Password reset error:', error);
        return NextResponse.json(
            { message: 'Error sending reset email' },
            { status: 500 }
        );
    }
}
