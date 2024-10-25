// src/components/SuperSpace.tsx
'use client';
import React, { useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    createSpace,
    setCurrentSpace,
    reorderSpacesOptimistic,
    reorderSpaces,
} from '@/store/spaceSlice';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa6';
import { FaPlusCircle } from 'react-icons/fa';
import { useDragLayer } from 'react-dnd';

import { generateRandomColor } from '@/app/utils/utils';
import { useAlert } from '@/hooks/useAlert';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';

import { ComponentSpinner } from '../ComponentSpinner';
import SpaceCard from './SpaceCard';

import { SpaceData } from '@/types';
import BuyMeACoffee from '../BuyMeACoffee';
import BottomSettings from './BottomSettings';

const SuperSpace: React.FC = React.memo(() => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobileSize = useIsMobileSize();
    const spaces = useSelector((state: RootState) => state.spaces.spaces);
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

    const addSpace = useCallback(() => {
        if (spaces.length >= 9) {
            showAlert('You can only have 9 spaces');
            return;
        }
        setIsAdding(true);
        const newSpace: SpaceData = {
            name: `Space ${spaces.length + 1}`,
            color: generateRandomColor(),
            maxZIndex: 1,
            selectedEmojis: [],
            selectedProgresses: [],
            selectedDueDateRange: null,
            emoji: '',
            order: spaces.length,
            taskOrder: [],
            wallpaper: '',
            backgroundColor: '',
        };
        dispatch(createSpace(newSpace)).then(() => {
            setIsAdding(false);
        });
    }, [spaces.length, dispatch, showAlert]);

    const containerVariants = {
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

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
        },
    };

    const { isDragging, currentOffset } = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    useAutoScroll(autoScrollRef, isDragging, currentOffset);

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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4 max-w-7xl mx-auto"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {spaces.map((space: SpaceData, index: number) => (
                            <motion.div key={space._id} variants={itemVariants}>
                                <SpaceCard
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
                            <motion.div variants={itemVariants}>
                                <div
                                    className={`space relative transition-colors duration-300 border-4 border-sky-200 rounded-lg shadow-md p-4 cursor-pointer flex items-center justify-center min-h-[150px] max-h-[300px] ${
                                        spaces.length >= 9
                                            ? 'opacity-50 cursor-not-allowed'
                                            : ''
                                    }`}
                                    onClick={addSpace}
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
