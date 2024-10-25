import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'ZenTodo',
    description: 'Productivity made fun and simple.', // Replace with your app's description
    openGraph: {
        title: 'ZenTodo',
        description: 'Productivity made fun and simple.',
        url: 'https://www.zentodo.space',
        siteName: 'ZenTodo',
        images: [
            {
                url: 'https://www.zentodo.space/images/ZenToDo_Log_slate700.png', // Replace with the actual path to your OG image
                width: 1200,
                height: 630,
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
