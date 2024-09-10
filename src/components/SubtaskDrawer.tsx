import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Task } from '@/types';

interface SubtaskDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubtaskDrawer: React.FC<SubtaskDrawerProps> = ({ isOpen, onClose }) => {
    const parentTaskId = useSelector(
        (state: RootState) => state.ui.subtaskDrawerParentId
    );
    const allTasks = useSelector((state: RootState) => state.tasks.tasks);

    const subtasks = React.useMemo(() => {
        if (!parentTaskId) return [];
        return allTasks.filter((task) => task.parentTask === parentTaskId);
    }, [allTasks, parentTaskId]);

    return (
        <div
            className={`fixed top-0 right-0 h-full bg-base-300 shadow-md transform ${
                isOpen ? '' : 'translate-x-full'
            } transition-transform duration-300 ease-in-out`}
        >
            <div className="p-4">
                <button onClick={onClose} className="text-red-500">
                    Close
                </button>
                <h2 className="text-xl font-bold mb-4">Subtasks</h2>
                <ul>
                    {subtasks.map((subtask) => (
                        <li key={subtask._id} className="mb-2">
                            <h3 className="font-semibold">
                                {subtask.taskName}
                            </h3>
                            <p>{subtask.taskDescription}</p>
                            <p>Status: {subtask.progress}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SubtaskDrawer;
