'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { store } from '../store/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <DndProvider backend={HTML5Backend}>
            <SessionProvider>
                <Provider store={store}>{children}</Provider>
            </SessionProvider>
        </DndProvider>
    );
}
