import { FaPlus } from 'react-icons/fa';
import { useTheme } from '@/hooks/useTheme';
import { useAddTask } from '@/hooks/useAddTask';
import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Task, TaskProgress } from '@/types';

export const MobileAddTaskButton = ({
    currentParent,
    spaceId,
}: {
    currentParent: Task | null;
    spaceId: string;
}) => {
    const currentTheme = useTheme();

    const { addTask } = useAddTask();
    const { addNewSubtask } = useAddNewSubtask();

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
            });
        } else {
            const newTask: Omit<Task, '_id'> = {
                taskName: '',
                taskDescription: '',
                x: Math.floor(Math.random() * 800) + 1,
                y: Math.floor(Math.random() * 800) + 1,
                progress: 'Not Started' as TaskProgress,
                space: spaceId,
                zIndex: 0,
                subtasks: [],
                parentTask: undefined,
                ancestors: [],
                width: 270,
                height: 250,
            };
            addTask(newTask);
        }
    };
    return (
        <div className="flex justify-end items-center fixed bottom-4 right-4 w-full">
            <div
                className="flex justify-center items-center p-4 rounded-full w-fit"
                style={{
                    backgroundColor: `var(--${currentTheme}-accent-blue)`,
                }}
                onClick={handleAddTask}
            >
                <FaPlus />
            </div>
        </div>
    );
};
