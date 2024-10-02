import { AppDispatch, RootState } from '@/store/store';
import { EmojiFilter } from '../Space/EmojiFilter';
import SortingDropdown from '../Subtask/SortingDropdown';
import Breadcrumb from './Breadcrumb';
import { Task } from '@/types';
import { useSelector } from 'react-redux';
import { setControlPanelOpen } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';
import ControlPanelToggle from '../SuperSpace/ControlPanelToggle';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTheme } from '@/hooks/useTheme';
import { useMemo, useState } from 'react';
import { MobileEmojiFilter } from './MobileEmojiFilter';
import { FaFilter } from 'react-icons/fa';
import { FaAngleUp, FaArrowUp, FaFilterCircleXmark } from 'react-icons/fa6';
import { AnimatePresence, motion } from 'framer-motion';

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
    const isMobile = useIsMobile();
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

    return (
        <div
            className="header sticky top-0 flex flex-col items-start justify-between w-full shadow-sm"
            style={{ zIndex: 10000 }}
        >
            <div
                className="header flex items-center justify-between p-2 w-full top-0"
                style={{
                    backgroundColor: `var(--${currentTheme}-background-100)`,
                }}
            >
                <ControlPanelToggle
                    isOpen={isControlPanelOpen}
                    setIsOpen={setIsOpen}
                    isMobile={isMobile}
                />
                <div
                    className="flex items-center justify-center gap-2"
                    style={{ color: `var(--${currentTheme}-emphasis-dark)` }}
                >
                    {hasRootLevelTasksWithEmojis && (
                        <button
                            className="p-2 rounded-full shadow-sm"
                            onClick={() => setShowEmojiFilter((prev) => !prev)}
                            style={{
                                backgroundColor: `var(--${currentTheme}-accent-blue)`,
                            }}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FaFilter />
                                {showEmojiFilter ? <FaAngleUp /> : null}
                            </div>
                        </button>
                    )}
                    {tasksAtLevel.length > 1 && <SortingDropdown />}
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
