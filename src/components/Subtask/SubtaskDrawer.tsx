import React, {
    forwardRef,
    ForwardedRef,
    useMemo,
    useCallback,
    useState,
    useEffect,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Task } from '@/types';
import SubtaskDrawerCard from './SubtaskDrawerCard';
import { FaAngleRight, FaXmark } from 'react-icons/fa6';
import { setSubtaskDrawerParentId } from '@/store/uiSlice';
import SubtaskDropZone from './SubtaskDropZone';
import SortingDropdown from './SortingDropdown';
import SimplicityModal from '../SimplicityModal';
import { setSimplicityModalOpen } from '@/store/uiSlice';
import { useTheme } from '@/hooks/useTheme';
import { AnimatePresence, motion } from 'framer-motion';
import { useDragLayer } from 'react-dnd';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { useRef } from 'react';
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

            const isSimplicityModalOpen = useSelector(
                (state: RootState) => state.ui.isSimplicityModalOpen
            );

            const isGlobalDragging = useSelector(
                (state: RootState) => state.ui.isGlobalDragging
            );
            const sortOption = useSelector(
                (state: RootState) => state.ui.sortOption
            );
            const isReversed = useSelector(
                (state: RootState) => state.ui.isReversed
            );
            const parentTaskId = useSelector(
                (state: RootState) => state.ui.subtaskDrawerParentId
            );
            const allTasks = useSelector(
                (state: RootState) => state.tasks.tasks
            );

            const parentTask = useMemo(() => {
                if (!parentTaskId) return null;
                return allTasks.find((t) => t._id === parentTaskId);
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
                if (!parentTask?.parentTask) return null;
                return allTasks.find((t) => t._id === parentTask?.parentTask);
            }, [allTasks, parentTask]);

            const handleSwitchParentTask = useCallback(
                (task: Task) => {
                    dispatch(setSubtaskDrawerParentId(task._id ?? ''));
                },
                [dispatch]
            );

            const sortedSubtasks = useMemo(() => {
                let sorted = [...allSubtasksOfParent];
                switch (sortOption) {
                    case 'name':
                        sorted.sort((a, b) =>
                            a.taskName.localeCompare(b.taskName)
                        );
                        break;
                    case 'progress':
                        sorted.sort((a, b) =>
                            a.progress.localeCompare(b.progress)
                        );
                        break;
                    case 'created':
                        sorted.sort(
                            (a, b) =>
                                new Date(b.createdAt as Date).getTime() -
                                new Date(a.createdAt as Date).getTime()
                        );
                        break;
                    case 'lastEdited':
                        sorted.sort(
                            (a, b) =>
                                new Date(b.updatedAt as Date).getTime() -
                                new Date(a.updatedAt as Date).getTime()
                        );
                        break;
                    default:
                        break;
                }
                if (isReversed) {
                    sorted.reverse();
                }
                return sorted;
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
                        const isOver =
                            e.clientX >= rect.left &&
                            e.clientX <= rect.right &&
                            e.clientY >= rect.top &&
                            e.clientY <= rect.bottom;
                        setIsTaskCardOver(isOver);
                    }
                };
                document.addEventListener('mousemove', handleMouseMove);

                return () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                };
            }, [isTaskCardOver, isGlobalDragging]);

            useEffect(() => {
                // Check if there are no subtasks and close the drawer
                if (isOpen && sortedSubtasks.length === 0) {
                    if (grandparentTask) {
                        handleSwitchParentTask(grandparentTask as Task);
                    } else {
                        onClose();
                    }
                }
            }, [isOpen, sortedSubtasks, isGlobalDragging]);

            const { isDragging, currentOffset } = useDragLayer((monitor) => ({
                isDragging: monitor.isDragging(),
                currentOffset: monitor.getSourceClientOffset(),
            }));

            useAutoScroll(
                autoScrollRef as React.RefObject<HTMLDivElement>,
                isDragging,
                currentOffset
            );

            const taskVariants = {
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
                exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
            };

            return (
                <div
                    ref={ref}
                    data-drawer-parent-id={parentTask?._id}
                    className={`subtask-drawer fixed top-0 right-0 h-full shadow-md transform w-[400px] border-l-2 ${
                        isOpen ? 'opacity-90' : 'translate-x-full opacity-0'
                    } transition-transform duration-300 ease-in-out h-full`}
                    style={{
                        backgroundColor: `var(--${currentTheme}-background-300)`, // Use theme color
                        borderColor: isTaskCardOver
                            ? `var(--${currentTheme}-accent-blue)`
                            : 'transparent', // Use theme color
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
                            <SortingDropdown />
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
                </div>
            );
        }
    )
);

SubtaskDrawer.displayName = 'SubtaskDrawer';

export default SubtaskDrawer;
