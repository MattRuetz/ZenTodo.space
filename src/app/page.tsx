'use client';
import { useSession } from 'next-auth/react';
import SuperSpace from '@/components/SuperSpace/SuperSpace';
import AuthPage from '@/components/AuthPage';

export default function Home() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!session) {
        return <AuthPage />;
    }

    return (
        <main className="w-full h-screen">
            <SuperSpace />
        </main>
    );
}
