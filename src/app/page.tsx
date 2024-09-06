// src/app/page.tsx
import ControlPanel from '@/components/ControlPanel';
import Space from '@/components/Space';

export default function Home() {
    return (
        <main className="w-full h-screen">
            <Space />
            <ControlPanel />
        </main>
    );
}
