'use client';
// src/components/SuperSpace.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpaces, createSpace, setCurrentSpace } from '@/store/spaceSlice';
import Space from '../Space/Space';
import { AppDispatch, RootState } from '@/store/store';
import { SpaceData, Task } from '@/types';
import ControlPanel from './ControlPanel';
import Preloader from './Preloader';
import { useSession } from 'next-auth/react';
import { Tooltip } from 'react-tooltip';

const SuperSpace = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();

    const { spaces, currentSpace, status } = useSelector(
        (state: RootState) => state.spaces
    );

    const [isZoomedOut, setIsZoomedOut] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    const { data: session, status: sessionStatus } = useSession();

    useEffect(() => {
        if (sessionStatus === 'authenticated' && status === 'idle') {
            dispatch(fetchSpaces()).then(() => {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 500); // Delay to allow fade-out animation
            });
        } else if (sessionStatus === 'unauthenticated') {
            setFadeOut(true);
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [sessionStatus, status, dispatch]);

    const addSpace = () => {
        const newSpace = {
            name: `Space ${spaces.length + 1}`,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            maxZIndex: 1,
        };
        dispatch(createSpace(newSpace));
    };

    const toggleZoom = () => {
        setIsZoomedOut(!isZoomedOut);
    };

    if (isLoading) {
        return <Preloader fadeOut={fadeOut} />;
    }

    return (
        <div className="relative w-full h-full">
            {isZoomedOut ? (
                <div className="grid grid-cols-3 gap-4 p-4">
                    {spaces.map((space: SpaceData) => (
                        <div
                            key={space._id}
                            className="space bg-white rounded-lg shadow-md p-4 cursor-pointer"
                            style={{ backgroundColor: space.color }}
                            onClick={() => {
                                dispatch(setCurrentSpace(space));
                                setIsZoomedOut(false);
                            }}
                        >
                            <h2 className="text-xl font-bold mb-2">
                                {space.name}
                            </h2>
                        </div>
                    ))}
                    <div
                        className="space bg-gray-100 rounded-lg shadow-md p-4 cursor-pointer flex items-center justify-center"
                        onClick={addSpace}
                    >
                        <span className="text-4xl">+</span>
                    </div>
                </div>
            ) : (
                (currentSpace || !session) && (
                    <>
                        <Space
                            spaceId={currentSpace?._id ?? ''}
                            onLoaded={() => setIsLoading(false)}
                        />
                        {session && <ControlPanel />}
                    </>
                )
            )}
            {session && (
                <>
                    <button
                        data-tooltip-id={`go-to-super-space-tooltip`}
                        onClick={toggleZoom}
                        className="absolute bottom-4 right-4 bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl"
                    >
                        {isZoomedOut ? '↩' : '↪'}
                    </button>
                    <Tooltip
                        id={`go-to-super-space-tooltip`}
                        style={{
                            zIndex: 100000,
                            backgroundColor: 'white',
                            color: 'black',
                        }}
                        place="left"
                    >
                        Go to Super Space
                    </Tooltip>
                </>
            )}
        </div>
    );
});

export default SuperSpace;