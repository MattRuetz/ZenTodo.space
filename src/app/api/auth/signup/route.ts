// src/app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import resend from '@/lib/resend';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { name, email, password } = await req.json();

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        // Send welcome email
        const { data, error } = await resend.emails.send({
            from: 'ZenTodo <noreply@zen-todo.com>',
            to: email,
            subject: 'Welcome to ZenTodo!',
            html: `
                <h1>Welcome to ZenTodo, ${name}!</h1>
                <p>We're excited to have you on board. Start organizing your tasks and boost your productivity today!</p>
                <p>If you have any questions, feel free to reach out to our support team.</p>
            `,
        });

        if (error) {
            console.error('Error sending welcome email:', error);
        }

        return NextResponse.json(
            { message: 'User created successfully' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'An error occurred during signup' },
            { status: 500 }
        );
    }
}
