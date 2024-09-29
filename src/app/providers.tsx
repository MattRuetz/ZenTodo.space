'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { store } from '../store/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ToastContainer } from 'react-toastify';
import { useIsMobile } from '@/hooks/useIsMobile';
import 'react-toastify/dist/ReactToastify.css';
import { EdgeStoreProvider } from '@/lib/edgestore';
import CustomDragLayer from '@/layers/customDragLayer';

export default function Providers({ children }: { children: React.ReactNode }) {
    const isMobile = useIsMobile();
    const backend = isMobile ? TouchBackend : HTML5Backend;

    return (
        <EdgeStoreProvider>
            <SessionProvider>
                <ToastContainer />
                <Provider store={store}>
                    <DndProvider
                        backend={backend}
                        options={{ enableMouseEvents: true }}
                    >
                        <CustomDragLayer />
                        {children}
                    </DndProvider>
                </Provider>
            </SessionProvider>
        </EdgeStoreProvider>
    );
}
