'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { SessionProvider } from 'next-auth/react';
import { store } from '../store/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <DndProvider backend={HTML5Backend}>
            <SessionProvider>
                <ToastContainer />
                <Provider store={store}>{children}</Provider>
            </SessionProvider>
        </DndProvider>
    );
}
