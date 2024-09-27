import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        const buffer = await file.arrayBuffer();
        const optimizedBuffer = await sharp(Buffer.from(buffer))
            .resize(200, 200)
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        return new NextResponse(optimizedBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/jpeg',
                'Content-Disposition':
                    'attachment; filename="optimized-image.jpeg"',
            },
        });
    } catch (error) {
        console.error('Error optimizing image:', error);
        return NextResponse.json(
            { error: 'Failed to optimize image' },
            { status: 500 }
        );
    }
}
