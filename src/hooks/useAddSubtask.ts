import { useDispatch } from 'react-redux';
import { addNewSubtask } from '@/store/tasksSlice';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '@/store/uiSlice';
import { toast } from 'react-toastify';
import { Task, TaskProgress } from '@/types';
import { AppDispatch } from '@/store/store';

interface UseAddSubtaskProps {
    task: Task;
    position?: string;
}

export const useAddSubtask = ({ task, position }: UseAddSubtaskProps) => {
    const dispatch = useDispatch<AppDispatch>();

    const handleAddSubtask = () => {
        const parentTask = task;
        const newSubtask: Omit<Task, '_id'> = {
            taskName: 'New Subtask',
            taskDescription: '',
            x: parentTask?.x || 0,
            y: parentTask?.y || 0,
            progress: 'Not Started' as TaskProgress,
            space: parentTask?.space || '',
            zIndex: parentTask?.zIndex || 0,
            subtasks: [],
            parentTask: parentTask?._id as string,
            ancestors: parentTask?.ancestors
                ? [...parentTask.ancestors, parentTask._id as string]
                : [parentTask?._id as string],
            dueDate: undefined,
            emoji: '',
            width: 100,
            height: 100,
        };

        dispatch(
            addNewSubtask({
                subtask: newSubtask,
                position: position || 'start',
            })
        );
        dispatch(setSubtaskDrawerOpen(true));
        dispatch(setSubtaskDrawerParentId(parentTask._id as string));
        toast.success('Subtask added successfully', {
            position: 'top-left',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
            style: {
                zIndex: 1000000,
            },
        });
    };

    return { handleAddSubtask };
};
