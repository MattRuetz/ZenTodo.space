import React, { forwardRef, ForwardedRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Task } from '@/types';
import { FaTimes } from 'react-icons/fa';
import SubtaskDrawerCard from './SubtaskDrawerCard';

interface SubtaskDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubtaskDrawer = forwardRef<HTMLDivElement, SubtaskDrawerProps>(
    ({ isOpen, onClose }, ref: ForwardedRef<HTMLDivElement>) => {
        const parentTaskId = useSelector(
            (state: RootState) => state.ui.subtaskDrawerParentId
        );
        const allTasks = useSelector((state: RootState) => state.tasks.tasks);

        const subtasks = React.useMemo(() => {
            if (!parentTaskId) return [];
            const parentTask = allTasks.find(
                (task) => task._id === parentTaskId
            );
            return parentTask
                ? parentTask.subtasks
                      .map((subtaskId) =>
                          allTasks.find((task) => task._id === subtaskId)
                      )
                      .filter(Boolean)
                : [];
        }, [allTasks, parentTaskId]);

        return (
            <div
                ref={ref}
                className={`fixed top-0 right-0 h-full bg-base-300 shadow-md transform w-[350px] ${
                    isOpen ? '' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out subtask-drawer-items`}
            >
                <div className="p-3 subtask-drawer-items">
                    <button
                        onClick={onClose}
                        className="text-red-500 flex items-center gap-1 subtask-drawer-items"
                    >
                        <FaTimes className="text-sm" /> Close
                    </button>
                    <h2 className="text-xl font-bold mb-4 subtask-drawer-items">
                        Subtasks
                    </h2>
                    <ul className="overflow-y-auto overflow-x-visible h-[calc(100vh-10rem)] subtask-drawer-items">
                        {subtasks.map((subtask) => (
                            <SubtaskDrawerCard
                                key={subtask?._id}
                                subtask={subtask as Task}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
);

SubtaskDrawer.displayName = 'SubtaskDrawer';

export default SubtaskDrawer;
