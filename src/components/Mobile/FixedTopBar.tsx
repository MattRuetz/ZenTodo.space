// src/components/Mobile/FixedTopBar.tsx
import React from 'react';
import { AppDispatch, RootState } from '@/store/store';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaFilter, FaAngleUp } from 'react-icons/fa6';

import SortingDropdown from '../Subtask/SortingDropdown';
import Breadcrumb from './Breadcrumb';
import ControlPanelToggle from '../ControlPanel/ControlPanelToggle';
import { MobileEmojiFilter } from './MobileEmojiFilter';
import { setControlPanelOpen } from '@/store/uiSlice';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { useTheme } from '@/hooks/useTheme';
import { Task } from '@/types';
import { getContrastingColor, darkenColor } from '@/app/utils/utils';

interface FixedTopBarProps {
    currentParent: Task | null;
    handleBack: () => void;
    tasksAtLevel: Task[];
}

const FixedTopBar: React.FC<FixedTopBarProps> = React.memo(
    ({ currentParent, handleBack, tasksAtLevel }) => {
        const dispatch = useDispatch<AppDispatch>();
        const isMobileSize = useIsMobileSize();
        const currentTheme = useTheme();
        const [showEmojiFilter, setShowEmojiFilter] = useState(false);

        // Use memoized selectors
        const currentSpace = useSelector(
            (state: RootState) => state.spaces.currentSpace
        );
        const isControlPanelOpen = useSelector(
            (state: RootState) => state.ui.isControlPanelOpen
        );

        const setIsOpen = useCallback(
            (isOpen: boolean) => {
                dispatch(setControlPanelOpen(isOpen));
            },
            [dispatch]
        );

        const hasRootLevelTasksWithEmojis = useMemo(() => {
            return tasksAtLevel.some(
                (task) =>
                    task.parentTask === undefined &&
                    task.emoji &&
                    task.space === currentSpace?._id
            );
        }, [tasksAtLevel, currentSpace?._id]);

        const topBarBackgroundColor = useMemo(() => {
            return currentSpace?.backgroundColor
                ? darkenColor(currentSpace.backgroundColor, 50)
                : `var(--${currentTheme}-space-background)`;
        }, [currentSpace?.backgroundColor, currentTheme]);

        const topBarTextColor = useMemo(() => {
            return currentSpace?.backgroundColor
                ? getContrastingColor(topBarBackgroundColor)
                : `var(--${currentTheme}-text-default)`;
        }, [topBarBackgroundColor, currentSpace?.backgroundColor]);

        const toggleEmojiFilter = useCallback(() => {
            setShowEmojiFilter((prev) => !prev);
        }, []);

        return (
            <div
                className="header sticky top-0 flex flex-col items-start justify-between w-full shadow-sm"
                style={{ zIndex: 10000 }}
            >
                <div
                    className="header flex items-center justify-between p-3 w-full top-0"
                    style={{
                        backgroundColor: topBarBackgroundColor,
                        borderColor: `var(--${currentTheme}-background-200)`,
                        color: topBarTextColor,
                    }}
                >
                    <ControlPanelToggle
                        isOpen={isControlPanelOpen}
                        setIsOpen={setIsOpen}
                        isMobile={isMobileSize}
                        color={topBarTextColor}
                    />
                    <div className="flex items-center justify-center gap-4">
                        {hasRootLevelTasksWithEmojis && (
                            <button
                                className="btn btn-sm btn-outline"
                                style={{ color: topBarTextColor }}
                                onClick={toggleEmojiFilter}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FaFilter />
                                    {showEmojiFilter ? <FaAngleUp /> : null}
                                </div>
                            </button>
                        )}
                        {tasksAtLevel.length > 1 && (
                            <SortingDropdown btnColor={topBarTextColor} />
                        )}
                    </div>
                </div>
                {currentParent ? (
                    <div
                        className="w-full px-4 py-2 border-b"
                        style={{
                            borderColor: `var(--${currentTheme}-background-300)`,
                            backgroundColor: `var(--${currentTheme}-background-300)`,
                        }}
                    >
                        <Breadcrumb
                            currentParent={currentParent}
                            onBack={handleBack}
                        />
                    </div>
                ) : (
                    <AnimatePresence>
                        {showEmojiFilter && hasRootLevelTasksWithEmojis && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: '70px', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: 'easeInOut',
                                }}
                                style={{ overflow: 'hidden' }}
                                className="w-full"
                            >
                                <MobileEmojiFilter
                                    spaceId={currentSpace?._id ?? ''}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        );
    }
);

export default FixedTopBar;
