import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Task } from '@/types';
import { FaTimes } from 'react-icons/fa';
import SubtaskDrawerCard from './SubtaskDrawerCard';

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
            className={`fixed top-0 right-0 h-full bg-base-300 shadow-md transform w-[350px] ${
                isOpen ? '' : 'translate-x-full'
            } transition-transform duration-300 ease-in-out`}
        >
            <div className="p-3">
                <button
                    onClick={onClose}
                    className="text-red-500 flex items-center gap-1"
                >
                    <FaTimes className="text-sm" /> Close
                </button>
                <h2 className="text-xl font-bold mb-4">Subtasks</h2>
                <ul className="overflow-y-auto overflow-x-visible h-[calc(100vh-10rem)]">
                    {subtasks.map((subtask) => (
                        <SubtaskDrawerCard
                            key={subtask._id}
                            subtask={subtask}
                        />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default SubtaskDrawer;
