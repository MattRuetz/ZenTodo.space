import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'ZenTodo',
    description: 'Productivity made fun and simple.', // Replace with your app's description
    author: 'Matt Ruetz',
    openGraph: {
        title: 'ZenTodo',
        description:
            'A responsive productivity app that removes the mental load of orginizing your tasks. Simple, fun, and robust organization of everyday tasks and long term goals.',
        url: 'https://www.zentodo.space',
        siteName: 'ZenTodo',
        images: [
            {
                url: 'https://www.zentodo.space/images/ZTD_social_preview.png',
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
