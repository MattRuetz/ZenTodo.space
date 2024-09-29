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

    const currentTasks = currentParent
        ? allTasks.filter((task) => task.parentTask === currentParent._id)
        : allTasks.filter((task) => !task.parentTask && task.space === spaceId);

    const sortedSubtasks = useMemo(() => {
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
            default:
                break;
        }
        if (isReversed) {
            sorted.reverse();
        }
        return sorted;
    }, [currentTasks, sortOption, isReversed]);

    useEffect(() => {
        // Check if there are no subtasks and close the drawer
        if (sortedSubtasks.length === 0) {
            if (currentParent && currentParent.parentTask) {
                dispatch(setSubtaskDrawerParentId(currentParent.parentTask));
            } else {
                dispatch(setSubtaskDrawerParentId(null));
            }
        }
    }, [sortedSubtasks, currentParent]);

    const handlers = useSwipeable({
        onSwipedRight: () => handleBack(),
        preventScrollOnSwipe: true,
    });

    return (
        <div
            {...handlers}
            className="task-list-view"
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
                    {sortedSubtasks.map((task, index) => (
                        <TaskListItem
                            key={task._id}
                            task={task}
                            onClick={() => handleTaskClick(task)}
                            index={index}
                            parentId={currentParent?._id || spaceId}
                        />
                    ))}
                </motion.ul>
            </AnimatePresence>
        </div>
    );
};

export default TaskListView;
