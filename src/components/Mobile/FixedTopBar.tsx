import { AppDispatch, RootState } from '@/store/store';
import SortingDropdown from '../Subtask/SortingDropdown';
import Breadcrumb from './Breadcrumb';
import { Task } from '@/types';
import { useSelector } from 'react-redux';
import { setControlPanelOpen } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';
import ControlPanelToggle from '../ControlPanel/ControlPanelToggle';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { useTheme } from '@/hooks/useTheme';
import { useMemo, useState } from 'react';
import { MobileEmojiFilter } from './MobileEmojiFilter';
import { FaFilter } from 'react-icons/fa';
import { FaAngleUp } from 'react-icons/fa6';
import { AnimatePresence, motion } from 'framer-motion';
import { getContrastingColor } from '@/app/utils/utils';

const FixedTopBar = ({
    currentParent,
    handleBack,
    tasksAtLevel,
}: {
    currentParent: Task | null;
    handleBack: () => void;
    tasksAtLevel: Task[];
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobileSize = useIsMobileSize();
    const currentTheme = useTheme();
    const [showEmojiFilter, setShowEmojiFilter] = useState(false);
    const currentSpace = useSelector(
        (state: RootState) => state.spaces.currentSpace
    );
    const isControlPanelOpen = useSelector(
        (state: RootState) => state.ui.isControlPanelOpen
    );
    const setIsOpen = (isOpen: boolean) => {
        dispatch(setControlPanelOpen(isOpen));
    };

    const hasRootLevelTasksWithEmojis = useMemo(() => {
        return tasksAtLevel.some(
            (task) =>
                task.parentTask === undefined &&
                task.emoji &&
                task.space === currentSpace?._id
        );
    }, [tasksAtLevel, currentSpace?._id]);

    const topBarBackgroundColor = useMemo(() => {
        if (!currentSpace?.backgroundColor) {
            return `var(--${currentTheme}-space-background)`;
        }

        const darkenColor = (color: string, amount: number) => {
            const colorHex = color.startsWith('#') ? color.slice(1) : color;
            const num = parseInt(colorHex, 16);
            const r = (num >> 16) - amount < 0 ? 0 : (num >> 16) - amount;
            const g =
                ((num >> 8) & 0x00ff) - amount < 0
                    ? 0
                    : ((num >> 8) & 0x00ff) - amount;
            const b =
                (num & 0x0000ff) - amount < 0 ? 0 : (num & 0x0000ff) - amount;
            return `#${(0x1000000 + (r << 16) + (g << 8) + b)
                .toString(16)
                .slice(1)}`;
        };

        return currentSpace?.backgroundColor
            ? darkenColor(currentSpace.backgroundColor, 50) // Adjust the amount as needed
            : `var(--${currentTheme}-space-background)`;
    }, [currentSpace?.backgroundColor, currentTheme]);

    const topBarTextColor = useMemo(() => {
        if (!currentSpace?.backgroundColor) {
            return `var(--${currentTheme}-text-default)`;
        }

        return getContrastingColor(topBarBackgroundColor);
    }, [topBarBackgroundColor, currentSpace?.backgroundColor]);

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
                            onClick={() => setShowEmojiFilter((prev) => !prev)}
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
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
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
};

export default FixedTopBar;
