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
import { generateRandomDarkColor } from '@/app/utils/utils';
import { toast } from 'react-toastify';
import SpaceCard from './SpaceCard';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '@/store/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';

const SuperSpace = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();

    const { spaces, currentSpace, status } = useSelector(
        (state: RootState) => state.spaces
    );

    const [isZoomedOut, setIsZoomedOut] = useState(false);
    // CHANGE THIS DEFAULT STATE TO TRUE WHEN WE WANT TO SHOW THE PRELOADER
    const [isLoading, setIsLoading] = useState(false);
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
        if (spaces.length >= 9) {
            toast.error('You can only create up to 9 spaces.', {
                position: 'top-right',
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: 'dark',
            });
            return;
        }
        const newSpace = {
            name: `Space ${spaces.length + 1}`,
            color: generateRandomDarkColor(),
            maxZIndex: 1,
            selectedEmojis: [],
            emoji: '',
        };
        dispatch(createSpace(newSpace));
    };

    const toggleZoom = () => {
        setIsZoomedOut(!isZoomedOut);
        dispatch(setSubtaskDrawerParentId(null));
        dispatch(setSubtaskDrawerOpen(false));
    };

    if (isLoading) {
        return <Preloader fadeOut={fadeOut} />;
    }

    const container = {
        hidden: { opacity: 1, scale: 0 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                delayChildren: 0.2,
                staggerChildren: 0.05,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    return (
        <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            {isZoomedOut ? (
                <>
                    <h4 className="text-xl text-white text-center pt-4 pb-2 font-bold">
                        Spaces: {spaces.length} / 9
                    </h4>

                    <AnimatePresence>
                        <motion.div
                            className="grid grid-cols-3 gap-8 p-4 h-[calc(100%-50px)]"
                            variants={container}
                            initial="hidden"
                            animate="visible"
                        >
                            {spaces.map((space: SpaceData) => (
                                <motion.div
                                    key={space._id}
                                    variants={item}
                                    className="h-full"
                                >
                                    <SpaceCard
                                        space={space}
                                        onClick={() => {
                                            dispatch(setCurrentSpace(space));
                                            setIsZoomedOut(false);
                                        }}
                                    />
                                </motion.div>
                            ))}
                            {spaces.length < 9 && (
                                <motion.div variants={item}>
                                    {spaces.length < 9 && (
                                        <div
                                            className={`space bg-slate-300 hover:bg-slate-400 transition-colors duration-300 border-4 border-sky-900 rounded-lg shadow-md p-4 cursor-pointer flex items-center justify-center min-h-[150px] max-h-[300px] ${
                                                spaces.length >= 9
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                            }`}
                                            onClick={
                                                spaces.length < 9
                                                    ? addSpace
                                                    : undefined
                                            }
                                        >
                                            <span className="text-4xl text-sky-900">
                                                +
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </>
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
                        className="absolute bg-sky-600 hover:bg-sky-400 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl"
                        style={
                            isZoomedOut
                                ? { left: '20px', top: '10px' }
                                : {
                                      right: '20px',
                                      bottom: '20px',
                                      zIndex: 100000,
                                  }
                        }
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
                        {isZoomedOut ? (
                            <>
                                Return to{' '}
                                <em>
                                    <strong>{currentSpace?.name}</strong>
                                </em>
                            </>
                        ) : (
                            'Go to Super Space'
                        )}
                    </Tooltip>
                </>
            )}
        </div>
    );
});

export default SuperSpace;
