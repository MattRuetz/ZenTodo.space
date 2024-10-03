import { FaArrowRight, FaCheck, FaPlus } from 'react-icons/fa';
import { useTheme } from '@/hooks/useTheme';
import { useAddTask } from '@/hooks/useAddTask';
import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Task, TaskProgress } from '@/types';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export const MobileAddTaskButton = ({
    currentParent,
    spaceId,
    onAddTask,
}: {
    currentParent: Task | null;
    spaceId: string;
    onAddTask: () => void;
}) => {
    const currentTheme = useTheme();
    const [justAddedTask, setJustAddedTask] = useState(false);
    const { addTask } = useAddTask();
    const { addNewSubtask } = useAddNewSubtask();

    useEffect(() => {
        if (justAddedTask) {
            setTimeout(() => {
                setJustAddedTask(false);
            }, 1000);
        }
    }, [justAddedTask]);

    const handleAddTask = () => {
        if (currentParent) {
            const newSubtask: Omit<Task, '_id'> = {
                taskName: 'New Subtask',
                taskDescription: '',
                x: currentParent?.x || 0,
                y: currentParent?.y || 0,
                progress: 'Not Started' as TaskProgress,
                space: currentParent?.space || '',
                zIndex: currentParent?.zIndex || 0,
                subtasks: [],
                parentTask: currentParent?._id as string,
                ancestors: currentParent?.ancestors
                    ? [...currentParent.ancestors, currentParent._id as string]
                    : [currentParent?._id as string],
                width: 100,
                height: 100,
                emoji: '',
            };

            addNewSubtask({
                subtask: newSubtask,
                parentId: currentParent?._id as string,
                position: 'start',
            }).then(() => {
                setJustAddedTask(true);
            });
        } else {
            const newTask: Omit<Task, '_id'> = {
                taskName: '',
                taskDescription: '',
                x: Math.floor(Math.random() * 300) + 1,
                y: Math.floor(Math.random() * 300) + 1,
                progress: 'Not Started' as TaskProgress,
                space: spaceId,
                zIndex: 0,
                subtasks: [],
                parentTask: undefined,
                ancestors: [],
                width: 270,
                height: 250,
            };
            addTask(newTask).then(() => {
                setJustAddedTask(true);
            });
        }
        onAddTask();
    };
    return (
        <div
            className="flex justify-end items-center fixed bottom-4 right-4 w-full"
            style={{
                zIndex: 1000,
            }}
        >
            <button
                className="btn btn-circle btn-md flex justify-center items-center"
                style={{
                    backgroundColor: `var(--${currentTheme}-accent-blue)`,
                    color: `var(--${currentTheme}-emphasis-dark)`,
                }}
                onClick={handleAddTask}
            >
                <AnimatePresence>
                    <motion.div
                        key={justAddedTask ? 'check' : 'plus'} // Add a key to help AnimatePresence identify the elements
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        // exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.5 }}
                    >
                        {justAddedTask ? <FaCheck /> : <FaPlus />}
                    </motion.div>
                </AnimatePresence>
            </button>
        </div>
    );
};
