// src/components/Subtask/SubtaskDrawer.tsx
import React, {
    forwardRef,
    ForwardedRef,
    useMemo,
    useCallback,
    useState,
    useEffect,
    useRef,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    setSubtaskDrawerParentId,
    setSimplicityModalOpen,
} from '@/store/uiSlice';
import { updateTask } from '@/store/tasksSlice';
import { FaAngleRight, FaXmark } from 'react-icons/fa6';
import { AnimatePresence, motion } from 'framer-motion';
import { useDragLayer } from 'react-dnd';

import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useTheme } from '@/hooks/useTheme';

import EmojiDropdown from '../EmojiDropdown';
import SimplicityModal from '../SimplicityModal';
import SortingDropdown from './SortingDropdown';
import SubtaskDrawerCard from './SubtaskDrawerCard';
import SubtaskDropZone from './SubtaskDropZone';

import { Task } from '@/types';

// Memoized selectors
const selectTasks = (state: RootState) => state.tasks.tasks;
const selectSimplicityModalOpen = (state: RootState) =>
    state.ui.isSimplicityModalOpen;
const selectGlobalDragging = (state: RootState) => state.ui.isGlobalDragging;
const selectSortOption = (state: RootState) => state.ui.sortOption;
const selectIsReversed = (state: RootState) => state.ui.isReversed;
const selectSubtaskDrawerParentId = (state: RootState) =>
    state.ui.subtaskDrawerParentId;

interface SubtaskDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    maxZIndex: number;
}

const SubtaskDrawer = React.memo(
    forwardRef<HTMLDivElement, SubtaskDrawerProps>(
        (
            { isOpen, onClose, maxZIndex }: SubtaskDrawerProps,
            ref: ForwardedRef<HTMLDivElement>
        ) => {
            const currentTheme = useTheme();
            const dispatch = useDispatch<AppDispatch>();
            const autoScrollRef = useRef<HTMLDivElement>(null);
            const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
            const [currentEmojiTask, setCurrentEmojiTask] = useState<
                string | null
            >(null);

            const isSimplicityModalOpen = useSelector(
                selectSimplicityModalOpen
            );
            const isGlobalDragging = useSelector(selectGlobalDragging);
            const sortOption = useSelector(selectSortOption);
            const isReversed = useSelector(selectIsReversed);
            const parentTaskId = useSelector(selectSubtaskDrawerParentId);
            const allTasks = useSelector(selectTasks);

            const parentTask = useMemo(() => {
                return parentTaskId
                    ? allTasks.find((t) => t._id === parentTaskId)
                    : null;
            }, [allTasks, parentTaskId]);

            const allSubtasksOfParent = useMemo(() => {
                if (!parentTask) return [];
                return parentTask.subtasks
                    .map((subtaskId) =>
                        allTasks.find((task) => task._id === subtaskId)
                    )
                    .filter((task): task is Task => task !== undefined);
            }, [allTasks, parentTask]);

            const grandparentTask = useMemo(() => {
                return parentTask?.parentTask
                    ? allTasks.find((t) => t._id === parentTask.parentTask)
                    : null;
            }, [allTasks, parentTask]);

            const handleSwitchParentTask = useCallback(
                (task: Task) => {
                    dispatch(setSubtaskDrawerParentId(task._id ?? ''));
                },
                [dispatch]
            );

            const sortedSubtasks = useMemo(() => {
                const sorted = [...allSubtasksOfParent];
                switch (sortOption) {
                    case 'name':
                        sorted.sort((a, b) =>
                            a.taskName.localeCompare(b.taskName)
                        );
                        break;
                    case 'dueDate':
                        sorted.sort((a, b) => {
                            const dateA = a.dueDate
                                ? new Date(a.dueDate).getTime()
                                : 0;
                            const dateB = b.dueDate
                                ? new Date(b.dueDate).getTime()
                                : 0;
                            return dateA - dateB;
                        });
                        break;
                    case 'progress':
                        sorted.sort((a, b) =>
                            a.progress.localeCompare(b.progress)
                        );
                        break;
                    case 'created':
                        sorted.sort((a, b) => {
                            const dateA = a.createdAt
                                ? new Date(a.createdAt).getTime()
                                : 0;
                            const dateB = b.createdAt
                                ? new Date(b.createdAt).getTime()
                                : 0;
                            return dateB - dateA;
                        });
                        break;
                    case 'lastEdited':
                        sorted.sort((a, b) => {
                            const dateA = a.updatedAt
                                ? new Date(a.updatedAt).getTime()
                                : 0;
                            const dateB = b.updatedAt
                                ? new Date(b.updatedAt).getTime()
                                : 0;
                            return dateB - dateA;
                        });
                        break;
                    default:
                        break;
                }
                return isReversed ? sorted.reverse() : sorted;
            }, [allSubtasksOfParent, sortOption, isReversed]);

            const [isTaskCardOver, setIsTaskCardOver] = useState(false);

            useEffect(() => {
                const handleMouseMove = (e: MouseEvent) => {
                    if (!isGlobalDragging) {
                        setIsTaskCardOver(false);
                        return;
                    }
                    if (ref && 'current' in ref && ref.current) {
                        const rect = ref.current.getBoundingClientRect();
                        setIsTaskCardOver(
                            e.clientX >= rect.left &&
                                e.clientX <= rect.right &&
                                e.clientY >= rect.top &&
                                e.clientY <= rect.bottom
                        );
                    }
                };
                document.addEventListener('mousemove', handleMouseMove);
                return () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                };
            }, [isGlobalDragging]);

            useEffect(() => {
                if (isOpen && sortedSubtasks.length === 0) {
                    if (grandparentTask) {
                        handleSwitchParentTask(grandparentTask as Task);
                    } else {
                        onClose();
                    }
                }
            }, [isOpen, sortedSubtasks, grandparentTask, onClose]);

            const { isDragging, currentOffset } = useDragLayer((monitor) => ({
                isDragging: monitor.isDragging(),
                currentOffset: monitor.getSourceClientOffset(),
            }));

            useAutoScroll(autoScrollRef, isDragging, currentOffset);

            const taskVariants = {
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
            };

            const handleSetSubtaskEmoji = (emoji: string) => {
                if (currentEmojiTask) {
                    dispatch(updateTask({ _id: currentEmojiTask, emoji }));
                }
                setIsEmojiPickerOpen(false);
                setCurrentEmojiTask(null);
            };

            return (
                <div
                    ref={ref}
                    data-drawer-parent-id={parentTask?._id}
                    className={`subtask-drawer fixed top-0 right-0 h-full shadow-md transform w-[400px] ${
                        isOpen ? 'opacity-100' : 'translate-x-full opacity-0'
                    } transition-transform duration-300 ease-in-out`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-300)`,
                        borderColor: isTaskCardOver
                            ? `var(--${currentTheme}-accent-blue)`
                            : 'transparent',
                        zIndex: isTaskCardOver ? 1 : 9999,
                    }}
                >
                    <SimplicityModal
                        isOpen={isSimplicityModalOpen}
                        onClose={() => dispatch(setSimplicityModalOpen(false))}
                    />
                    <div className="p-3 subtask-drawer-items">
                        <div
                            className="flex flex-row justify-between items-center p-2 rounded-md"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-100)`,
                            }}
                        >
                            <h2
                                className="text-lg font-bold uppercase subtask-drawer-items text-center w-full"
                                style={{
                                    color: `var(--${currentTheme}-emphasis-light)`,
                                }}
                            >
                                Subtasks
                            </h2>
                            <button
                                onClick={onClose}
                                className="flex items-center gap-1 subtask-drawer-items text-red-500 hover:text-white hover:bg-red-500 rounded-full transition-colors duration-300 p-1"
                            >
                                <FaXmark className="text-sm" />
                            </button>
                        </div>
                        <div className="flex flex-row gap-2 w-full pt-2">
                            <p
                                className="uppercase text-xs font-bold"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            >
                                Parent Tasks:
                            </p>
                        </div>
                        <div
                            className="flex items-center gap-2 py-2 text-sm"
                            style={{
                                color: `var(--${currentTheme}-text-subtle)`,
                            }}
                        >
                            <div className="flex flex-row items-center gap-2 w-full text-sm">
                                {grandparentTask && (
                                    <>
                                        <p
                                            className="p-2 shadow-sm rounded-md cursor-pointer w-full max-w-32 break-words overflow-wrap-anywhere border-2 hover:brightness-110"
                                            style={{
                                                backgroundColor: `var(--${currentTheme}-background-100)`, // Use theme color
                                                borderColor: `var(--${currentTheme}-background-100)`,
                                                color: `var(--${currentTheme}-emphasis-light)`, // Use theme color
                                            }}
                                            onClick={() =>
                                                handleSwitchParentTask(
                                                    grandparentTask as Task
                                                )
                                            }
                                        >
                                            {grandparentTask?.taskName}
                                        </p>
                                        <FaAngleRight
                                            className="text-sm"
                                            style={{
                                                color: `var(--${currentTheme}-text-subtle)`,
                                            }}
                                            size={24}
                                        />
                                    </>
                                )}
                                <>
                                    <p
                                        className="p-2 rounded-md cursor-default max-w-32 w-full break-words overflow-wrap-anywhere border-2"
                                        onClick={() =>
                                            handleSwitchParentTask(
                                                parentTask as Task
                                            )
                                        }
                                        style={{
                                            borderColor: `var(--${currentTheme}-background-100)`,
                                            color: `var(--${currentTheme}-text-default)`, // Use theme color
                                        }}
                                    >
                                        {parentTask?.taskName}
                                    </p>
                                </>
                            </div>
                            <div className="flex items-center">
                                <SortingDropdown
                                    btnColor={`var(--${currentTheme}-text-default)`}
                                />
                            </div>
                        </div>
                        <div
                            className="flex flex-row gap-2 h-0.5 w-full"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-100)`,
                            }}
                        ></div>

                        <div
                            ref={autoScrollRef}
                            className="overflow-y-auto overflow-x-visible h-[calc(100vh-10rem)] subtask-drawer-items pt-2"
                        >
                            <ul>
                                <SubtaskDropZone
                                    position="start"
                                    parentTask={parentTask as Task}
                                    isDragging={isDragging}
                                />
                                <AnimatePresence mode="popLayout">
                                    <motion.ul
                                        initial={{ x: 300 }}
                                        animate={{ x: 0 }}
                                        exit={{ x: -300 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 300,
                                            damping: 30,
                                        }}
                                    >
                                        {sortedSubtasks.map(
                                            (subtask, index) => (
                                                <motion.div
                                                    key={subtask?._id}
                                                    layout
                                                    variants={taskVariants}
                                                    initial="hidden"
                                                    animate="visible"
                                                    exit="exit"
                                                    transition={{
                                                        type: 'spring',
                                                        stiffness: 500,
                                                        damping: 30,
                                                        mass: 1,
                                                        layoutDuration: 0.3,
                                                    }}
                                                >
                                                    <SubtaskDrawerCard
                                                        subtask={
                                                            subtask as Task
                                                        }
                                                        position={
                                                            subtask._id as string
                                                        }
                                                        maxZIndex={maxZIndex}
                                                        setCurrentEmojiTask={
                                                            setCurrentEmojiTask
                                                        }
                                                        setIsEmojiPickerOpen={
                                                            setIsEmojiPickerOpen
                                                        }
                                                    />
                                                    <SubtaskDropZone
                                                        position={`after_${subtask._id}`}
                                                        parentTask={
                                                            parentTask as Task
                                                        }
                                                        isDragging={isDragging}
                                                    />
                                                </motion.div>
                                            )
                                        )}
                                    </motion.ul>
                                </AnimatePresence>
                            </ul>
                        </div>
                    </div>
                    <EmojiDropdown
                        taskEmoji=""
                        setTaskEmoji={handleSetSubtaskEmoji}
                        isModal={true}
                        isOpen={isEmojiPickerOpen}
                        setIsOpen={setIsEmojiPickerOpen}
                    />
                </div>
            );
        }
    )
);

SubtaskDrawer.displayName = 'SubtaskDrawer';

export default SubtaskDrawer;
