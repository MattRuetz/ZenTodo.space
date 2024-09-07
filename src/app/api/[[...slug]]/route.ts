// src/app/api/[[...slug]]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    console.log('Received GET request:', req.url);
    return NextResponse.json({ message: 'Catch-all route' });
}

export async function POST(req: NextRequest) {
    console.log('Received POST request:', req.url);
    return NextResponse.json({ message: 'Catch-all route' });
}

export async function PATCH(req: NextRequest) {
    console.log('Received PATCH request:', req.url);
    return NextResponse.json({ message: 'Catch-all route' });
}
