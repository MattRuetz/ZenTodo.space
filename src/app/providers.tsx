'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ToastContainer } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import 'react-toastify/dist/ReactToastify.css';
import { EdgeStoreProvider } from '@/lib/edgestore';
import CustomDragLayer from '@/layers/customDragLayer';
import { MobileAlertProvider } from '@/hooks/useAlert';
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';

export default function Providers({ children }: { children: React.ReactNode }) {
    const isMobileSize = useIsMobileSize();
    const backend = isMobile || isMobileSize ? TouchBackend : HTML5Backend;

    return (
        <ClerkProvider>
            <MobileAlertProvider>
                <EdgeStoreProvider>
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
                </EdgeStoreProvider>
            </MobileAlertProvider>
        </ClerkProvider>
    );
}
