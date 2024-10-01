import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { Task } from '@/types';
import TaskListItem from './TaskListItem';
import { fetchTasks } from '@/store/tasksSlice';
import { useTheme } from '@/hooks/useTheme';
import { selectTasksForSpace } from '@/store/selectors';
import { setSubtaskDrawerParentId } from '@/store/uiSlice';
import Breadcrumb from './Breadcrumb';
import SortingDropdown from '../Subtask/SortingDropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import TaskListDropZone from './TaskListDropZone';
import { useDrop } from 'react-dnd';
import { useMoveTask } from '@/hooks/useMoveTask';
import { updateSpaceTaskOrderAsync } from '@/store/spaceSlice';
import { MobileAddTaskButton } from './MobileAddTaskButton';
import { useIsMobile } from '@/hooks/useIsMobile';
import FixedTopBar from './FixedTopBar';

interface TaskListViewProps {
    spaceId: string;
}

const TaskListView: React.FC<TaskListViewProps> = ({ spaceId }) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const isMobile = useIsMobile();
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
                console.log('dropping');
                commitTaskOrder(currentParent?._id || null);
            }
        },
    });

    drop(listRef);

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
        if (sortOption === 'custom' || !sortOption) {
            // If sorting is set to custom or not set, use the current order
            return currentTasks;
        }

        let sorted = [...currentTasks];
        switch (sortOption) {
            case 'name':
                sorted.sort((a, b) => a.taskName.localeCompare(b.taskName));
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
    }, [currentTasks, sortOption, isReversed]);

    const handlers = useSwipeable({
        onSwipedRight: () => handleBack(),
        preventScrollOnSwipe: true,
    });

    const handleAddTask = () => {
        console.log('add task');
    };

    return (
        <div
            {...handlers}
            ref={listRef}
            className="task-list-view pt-16 overflow-y-auto h-full"
            style={{
                backgroundColor: `var(--${currentTheme}-background-300)`,
                minHeight: '100vh',
            }}
        >
            <FixedTopBar
                currentParent={currentParent}
                handleBack={handleBack}
            />
            <AnimatePresence>
                <motion.ul
                    initial={{ x: 300 }}
                    animate={{ x: 0 }}
                    exit={{ x: -300 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {sortedTasksAtLevel.map((task, index) => (
                        <React.Fragment key={task._id}>
                            <TaskListDropZone
                                position={
                                    index === 0
                                        ? 'start'
                                        : `after_${
                                              sortedTasksAtLevel[index - 1]._id
                                          }`
                                }
                                parentId={currentParent?._id || null}
                            />
                            <TaskListItem
                                task={task}
                                onClick={() => handleTaskClick(task)}
                                index={index}
                                parentId={currentParent?._id || null}
                            />
                        </React.Fragment>
                    ))}
                    {/* Add a drop zone at the end */}
                    <TaskListDropZone
                        position={`after_${
                            sortedTasksAtLevel[sortedTasksAtLevel.length - 1]
                                ?._id
                        }`}
                        parentId={currentParent?._id || null}
                    />
                </motion.ul>
            </AnimatePresence>

            {isMobile && (
                <MobileAddTaskButton
                    currentParent={currentParent}
                    spaceId={spaceId}
                />
            )}
        </div>
    );
};

export default TaskListView;
