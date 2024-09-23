'use client';
// src/components/SuperSpace.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchSpaces,
    createSpace,
    setCurrentSpace,
    reorderSpacesOptimistic,
    reorderSpaces,
} from '@/store/spaceSlice';
import Space from '../Space/Space';
import { AppDispatch, RootState } from '@/store/store';
import { SpaceData, Task } from '@/types';
import ControlPanel from './ControlPanel';
import Preloader from './Preloader';
import { useSession } from 'next-auth/react';
import { Tooltip } from 'react-tooltip';
import { generateRandomColor } from '@/app/utils/utils';
import SpaceCard from './SpaceCard';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '@/store/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useAlert } from '@/hooks/useAlert';
import { useTheme } from '@/hooks/useTheme';

const SuperSpace = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const { spaces, currentSpace, status } = useSelector(
        (state: RootState) => state.spaces
    );

    const [isZoomedOut, setIsZoomedOut] = useState(false);
    // CHANGE THIS DEFAULT STATE TO TRUE WHEN WE WANT TO SHOW THE PRELOADER
    const [isLoading, setIsLoading] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const { data: session, status: sessionStatus } = useSession();

    const { showAlert } = useAlert();

    const moveSpaceCard = useCallback(
        (dragIndex: number, hoverIndex: number) => {
            const draggedSpace = spaces[dragIndex];
            const newSpaces = [...spaces];
            newSpaces.splice(dragIndex, 1);
            newSpaces.splice(hoverIndex, 0, draggedSpace);
            dispatch(reorderSpacesOptimistic(newSpaces));
        },
        [spaces, dispatch]
    );

    const handleDragEnd = useCallback(() => {
        dispatch(reorderSpaces(spaces));
    }, [spaces, dispatch]);

    useEffect(() => {
        if (sessionStatus === 'authenticated' && status === 'idle') {
            dispatch(fetchSpaces()).then(() => {
                setFadeOut(true);
                setTimeout(() => setIsLoading(false), 500);
            });
        } else if (sessionStatus === 'unauthenticated') {
            setFadeOut(true);
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [sessionStatus, status, dispatch]);

    const addSpace = () => {
        if (spaces.length >= 9) {
            showAlert('You can only have 9 spaces');
            return;
        }
        const newSpace = {
            name: `Space ${spaces.length + 1}`,
            color: generateRandomColor(),
            maxZIndex: 1,
            selectedEmojis: [],
            emoji: '',
            order: spaces.length,
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
        <DndProvider backend={HTML5Backend}>
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
                                {spaces.map(
                                    (space: SpaceData, index: number) => (
                                        <motion.div variants={item}>
                                            <SpaceCard
                                                key={space._id}
                                                space={space}
                                                index={index}
                                                handleDragEnd={handleDragEnd}
                                                moveSpaceCard={moveSpaceCard}
                                                onClick={() => {
                                                    dispatch(
                                                        setCurrentSpace(space)
                                                    );
                                                    setIsZoomedOut(false);
                                                }}
                                            />
                                        </motion.div>
                                    )
                                )}
                                {spaces.length < 9 && (
                                    <motion.div variants={item}>
                                        <div
                                            className={`space bg-slate-300 hover:bg-slate-400 transition-colors duration-300 border-4 border-sky-900 rounded-lg shadow-md p-4 cursor-pointer flex items-center justify-center min-h-[150px] max-h-[300px] ${
                                                spaces.length >= 9
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : ''
                                            }`}
                                            onClick={() => {
                                                if (spaces.length < 9) {
                                                    setIsAdding(true);
                                                    addSpace();
                                                    setIsAdding(false);
                                                }
                                            }}
                                        >
                                            <span
                                                className={`plus-icon text-4xl text-sky-900 ${
                                                    isAdding ? 'invisible' : ''
                                                }`}
                                            >
                                                +
                                            </span>
                                            <span
                                                className={`${
                                                    isAdding
                                                        ? 'visible'
                                                        : 'invisible'
                                                } delete-spinner loading loading-ring text-slate-600 loading-lg`}
                                            ></span>
                                        </div>
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
                            className="absolute text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:scale-110 transition-all duration-200"
                            style={
                                isZoomedOut
                                    ? {
                                          left: '20px',
                                          top: '10px',
                                          backgroundColor: 'white',
                                          color: 'black',
                                      }
                                    : {
                                          right: '20px',
                                          bottom: '20px',
                                          zIndex: 100000,
                                          backgroundColor: `var(--${currentTheme}-background-100)`,
                                          color: `var(--${currentTheme}-emphasis-light)`,
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
        </DndProvider>
    );
});

export default SuperSpace;
