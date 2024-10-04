'use client';
// src/components/SuperSpace.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import { useSession } from 'next-auth/react';
import { Tooltip } from 'react-tooltip';
import { generateRandomColor } from '@/app/utils/utils';
import SpaceCard from './SpaceCard';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '@/store/uiSlice';
import { AnimatePresence, motion } from 'framer-motion';
//---------------------------------------------------
import { useAlert } from '@/hooks/useAlert';
import { useTheme } from '@/hooks/useTheme';
import { FaArrowLeft } from 'react-icons/fa6';
import { FaPlusCircle } from 'react-icons/fa';
import ProfileArchivePage from '../Profile_Archive/ProfileArchivePage';
import { setUser } from '@/store/userSlice';
import BottomSettings from './BottomSettings';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { isMobile } from 'react-device-detect';
import { useDragLayer } from 'react-dnd';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { ComponentSpinner } from '../ComponentSpinner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SuperSpace = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobileSize = useIsMobileSize();
    const { spaces } = useSelector((state: RootState) => state.spaces);
    const router = useRouter();
    const [isAdding, setIsAdding] = useState(false);

    const autoScrollRef = useRef<HTMLDivElement>(null);

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

    const addSpace = () => {
        if (spaces.length >= 9) {
            showAlert('You can only have 9 spaces');
            return;
        }
        setIsAdding(true);
        const newSpace = {
            name: `Space ${spaces.length + 1}`,
            color: generateRandomColor(),
            maxZIndex: 1,
            selectedEmojis: [],
            emoji: '',
            order: spaces.length,
            taskOrder: [],
        };
        dispatch(createSpace(newSpace)).then(() => {
            setIsAdding(false);
        });
    };

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

    // Make sure the user is set in the redux store
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user');
                if (response.ok) {
                    const userData = await response.json();
                    dispatch(setUser(userData));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [dispatch]);

    const { isDragging, currentOffset } = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    useAutoScroll(
        autoScrollRef as React.RefObject<HTMLDivElement>,
        isDragging,
        currentOffset
    );

    return (
        <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden">
            <div
                ref={autoScrollRef}
                className="overflow-y-auto h-[calc(100%-50px)] pb-20"
            >
                <h4 className="text-xl text-white text-center pt-4 pb-2 font-bold">
                    Spaces: {spaces.length} / 9
                </h4>

                <AnimatePresence>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4"
                        variants={container}
                        initial="hidden"
                        animate="visible"
                    >
                        {spaces.map((space: SpaceData, index: number) => (
                            <motion.div variants={item}>
                                <SpaceCard
                                    key={space._id}
                                    space={space}
                                    index={index}
                                    handleDragEnd={handleDragEnd}
                                    moveSpaceCard={moveSpaceCard}
                                    onClick={() => {
                                        dispatch(setCurrentSpace(space));
                                    }}
                                />
                            </motion.div>
                        ))}
                        {spaces.length < 9 && (
                            <motion.div variants={item}>
                                <div
                                    className={`space relative transition-colors duration-300 border-4 border-sky-200 rounded-lg shadow-md p-4 cursor-pointer flex items-center justify-center min-h-[150px] max-h-[300px] ${
                                        spaces.length >= 9
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    onClick={() => {
                                        if (spaces.length < 9) {
                                            addSpace();
                                        }
                                    }}
                                >
                                    {isAdding ? (
                                        <ComponentSpinner />
                                    ) : (
                                        <span
                                            className={
                                                'plus-icon text-4xl text-sky-200 text-center'
                                            }
                                        >
                                            <FaPlusCircle />
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                        {spaces.length === 0 && !isMobileSize && (
                            <div className="text-center w-5/12 flex items-center justify-center h-[150px] gap-2 text-slate-400">
                                <FaArrowLeft className="text-4xl mb-4" />
                                <span className="text-xl">
                                    Click the{' '}
                                    <FaPlusCircle className="inline-block" /> to
                                    add a space
                                </span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
});

export default SuperSpace;
