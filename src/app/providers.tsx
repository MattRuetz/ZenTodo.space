'use client';

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState, store } from '../store/store';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';
import { ToastContainer } from 'react-toastify';
import { isMobile } from 'react-device-detect';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { EdgeStoreProvider } from '@/lib/edgestore';
import CustomDragLayer from '@/layers/customDragLayer';
import { MobileAlertProvider } from '@/hooks/useAlert';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import { fetchUser } from '@/store/userSlice';
import { fetchSpaces } from '@/store/spaceSlice';
import { fetchTheme } from '@/store/themeSlice';
import { fetchTasks } from '@/store/tasksSlice';
import { setInitialDataLoaded } from '@/store/loadingSlice';

const DataFetcher = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { isSignedIn, isLoaded } = useUser();
    const initialDataLoaded = useSelector(
        (state: RootState) => state.loading.initialDataLoaded
    );

    useEffect(() => {
        const fetchData = async () => {
            if (isSignedIn && !initialDataLoaded) {
                await dispatch(fetchSpaces());
                await dispatch(fetchTasks());
                await dispatch(fetchTheme());
                await dispatch(fetchUser());
                dispatch(setInitialDataLoaded(true));
            }
        };

        if (typeof window !== 'undefined' && isLoaded) {
            fetchData();
        }
    }, [isSignedIn, isLoaded, initialDataLoaded, dispatch]);

    return <>{children}</>;
};

export default function Providers({ children }: { children: React.ReactNode }) {
    const isMobileSize = useIsMobileSize();
    const backend = isMobile || isMobileSize ? TouchBackend : HTML5Backend;

    return (
        <ClerkProvider>
            <MobileAlertProvider>
                <EdgeStoreProvider>
                    <ToastContainer />
                    <Provider store={store}>
                        <DataFetcher>
                            <DndProvider
                                backend={backend}
                                options={{ enableMouseEvents: true }}
                            >
                                <CustomDragLayer />
                                {children}
                            </DndProvider>
                        </DataFetcher>{' '}
                    </Provider>
                </EdgeStoreProvider>
            </MobileAlertProvider>
        </ClerkProvider>
    );
}
