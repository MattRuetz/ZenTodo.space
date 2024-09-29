import React, { useState, useEffect, useMemo } from 'react';
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
            // For root-level tasks, filter as before
            return allTasks.filter(
                (task) => !task.parentTask && task.space === spaceId
            );
        }
    }, [currentParent, allTasks, spaceId]);

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

    return (
        <div
            {...handlers}
            className="task-list-view pt-16 overflow-y-auto h-full"
            style={{
                backgroundColor: `var(--${currentTheme}-background-200)`,
                minHeight: '100vh',
            }}
        >
            <div className="header flex items-center justify-between p-4">
                <Breadcrumb task={currentParent} onBack={handleBack} />
                <SortingDropdown />
            </div>
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
        </div>
    );
};

export default TaskListView;
