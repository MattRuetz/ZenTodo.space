import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Task } from '@/types';
import TaskListItem from './TaskListItem';
import { fetchTasks } from '@/store/tasksSlice';
import { useTheme } from '@/hooks/useTheme';
import { setSubtaskDrawerParentId } from '@/store/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import TaskListDropZone from './TaskListDropZone';
import { useDrop, useDragLayer } from 'react-dnd';
import { useMoveTask } from '@/hooks/useMoveTask';
import { MobileAddTaskButton } from './MobileAddTaskButton';
import FixedTopBar from './FixedTopBar';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import { isTablet } from 'react-device-detect';

interface TaskListViewProps {
    spaceId: string;
}

const TaskListView: React.FC<TaskListViewProps> = ({ spaceId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const allTasks = useSelector((state: RootState) => state.tasks.tasks);
    const parentTaskId = useSelector(
        (state: RootState) => state.ui.subtaskDrawerParentId
    );
    const [currentParent, setCurrentParent] = useState<Task | null>(null);
    const sortOption = useSelector((state: RootState) => state.ui.sortOption);
    const isReversed = useSelector((state: RootState) => state.ui.isReversed);
    const space = useSelector((state: RootState) =>
        state.spaces.spaces.find((space) => space._id === spaceId)
    );

    const { commitTaskOrder } = useMoveTask();
    const listRef = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: 'TASK',
        drop: (item: { id: string }, monitor) => {
            const didDrop = monitor.didDrop();
            if (!didDrop) {
                commitTaskOrder(currentParent?._id || null);
            }
        },
    });

    drop(listRef);

    const { isDragging, currentOffset } = useDragLayer((monitor) => ({
        isDragging: monitor.isDragging(),
        currentOffset: monitor.getSourceClientOffset(),
    }));

    useAutoScroll(listRef, isDragging, currentOffset);

    useEffect(() => {
        dispatch(fetchTasks());
    }, [dispatch]);

    useEffect(() => {
        if (parentTaskId) {
            const parentTask = allTasks.find(
                (task) => task._id === parentTaskId
            );
            setCurrentParent(parentTask || null);
        } else {
            setCurrentParent(null);
        }
    }, [parentTaskId, allTasks]);

    const handleTaskClick = (task: Task) => {
        if (task.subtasks && task.subtasks.length > 0) {
            dispatch(setSubtaskDrawerParentId(task._id || ''));
        }
    };

    const handleBack = () => {
        if (currentParent && currentParent.parentTask) {
            dispatch(setSubtaskDrawerParentId(currentParent.parentTask));
        } else {
            dispatch(setSubtaskDrawerParentId(null));
        }
    };

    const currentTasks = useMemo(() => {
        if (currentParent) {
            // For subtasks, use the order from the parent's subtasks array
            return currentParent.subtasks
                .map((subtaskId) =>
                    allTasks.find((task) => task._id === subtaskId)
                )
                .filter(Boolean) as Task[];
        } else {
            // For root-level tasks, use the space's taskOrder
            const tasksAtLevel = allTasks.filter(
                (task) => !task.parentTask && task.space === spaceId
            );

            const tasksMap = new Map(
                tasksAtLevel.map((task) => [task._id, task])
            );

            return (space?.taskOrder || [])
                .map((taskId) => tasksMap.get(taskId))
                .filter(Boolean) as Task[];
        }
    }, [currentParent, allTasks, spaceId, space?.taskOrder]);

    const sortedTasksAtLevel = useMemo(() => {
        let sorted = [...currentTasks];

        if (space?.selectedEmojis.length && space.selectedEmojis.length > 0) {
            sorted = sorted.filter((task) =>
                space.selectedEmojis.includes(task.emoji || '')
            );
        }

        if (sortOption === 'custom' || !sortOption) {
            // If sorting is set to custom or not set, use the current order
            return sorted;
        }

        switch (sortOption) {
            case 'name':
                sorted.sort((a, b) => a.taskName.localeCompare(b.taskName));
                break;
            case 'dueDate':
                sorted.sort(
                    (a, b) =>
                        new Date(a.dueDate as Date).getTime() -
                        new Date(b.dueDate as Date).getTime()
                );
                break;
            case 'progress':
                sorted.sort((a, b) => a.progress.localeCompare(b.progress));
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
        }
        return isReversed ? sorted.reverse() : sorted;
    }, [currentTasks, sortOption, isReversed, space?.selectedEmojis]);

    const handlers = useSwipeable({
        onSwipedRight: () => handleBack(),
        preventScrollOnSwipe: true,
    });

    const scrollToTop = () => {
        listRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const taskVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -50, transition: { duration: 0.2 } },
    };

    return (
        <>
            <div
                {...handlers}
                className="task-list-view h-full flex flex-col"
                style={{
                    backgroundColor: `var(--${currentTheme}-space-background)`,
                }}
            >
                <FixedTopBar
                    currentParent={currentParent}
                    handleBack={handleBack}
                    tasksAtLevel={sortedTasksAtLevel}
                />
                {sortedTasksAtLevel.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center pointer-events-none w-8/12 mx-auto h-3/4"
                        style={{
                            scrollbarColor: '#0077ff #e7e5e4',
                        }}
                    >
                        <AnimatePresence>
                            <motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 3,
                                        delay: 1,
                                        ease: 'easeInOut',
                                    }}
                                >
                                    <h1 className="text-center text-gray-500 text-5xl font-thin">
                                        emptiness is bliss
                                    </h1>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{
                                        duration: 3,
                                        delay: 2,
                                        ease: 'easeInOut',
                                    }}
                                ></motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                ) : (
                    <div
                        className="h-full overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-rounded-full"
                        ref={listRef}
                        style={{
                            scrollbarColor: `var(--${currentTheme}-text-subtle) var(--${currentTheme}-background-200)`,
                        }}
                    >
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
                                {sortedTasksAtLevel.map((task, index) => (
                                    <motion.div
                                        key={task.clientId || task._id}
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
                                        // Weird solution to cards overlapping menu.. but it works
                                        className={
                                            !isDragging ? `relative` : ''
                                        }
                                    >
                                        <TaskListDropZone
                                            key={task.clientId || task._id}
                                            position={
                                                index === 0
                                                    ? 'start'
                                                    : `after_${
                                                          sortedTasksAtLevel[
                                                              index - 1
                                                          ]._id
                                                      }`
                                            }
                                            parentId={
                                                currentParent?._id || null
                                            }
                                        />
                                        <TaskListItem
                                            key={task.clientId || task._id}
                                            task={task}
                                            onClick={() =>
                                                handleTaskClick(task)
                                            }
                                            index={index}
                                            parentId={
                                                currentParent?._id || null
                                            }
                                        />
                                    </motion.div>
                                ))}
                                <TaskListDropZone
                                    position={`after_${
                                        sortedTasksAtLevel[
                                            sortedTasksAtLevel.length - 1
                                        ]?._id
                                    }`}
                                    parentId={currentParent?._id || null}
                                />
                            </motion.ul>
                        </AnimatePresence>
                    </div>
                )}

                <MobileAddTaskButton
                    currentParent={currentParent}
                    spaceId={spaceId}
                    onAddTask={scrollToTop}
                />
            </div>
        </>
    );
};

export default TaskListView;
