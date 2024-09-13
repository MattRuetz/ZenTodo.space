import React, { forwardRef, ForwardedRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Task } from '@/types';
import SubtaskDrawerCard from './SubtaskDrawerCard';
import { FaAngleRight, FaAnglesRight, FaX, FaXmark } from 'react-icons/fa6';
import { setSubtaskDrawerParentId } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';
import SubtaskDropZone from './SubtaskDropZone';

interface SubtaskDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const SubtaskDrawer = forwardRef<HTMLDivElement, SubtaskDrawerProps>(
    ({ isOpen, onClose }, ref: ForwardedRef<HTMLDivElement>) => {
        const dispatch = useDispatch();

        const parentTaskId = useSelector(
            (state: RootState) => state.ui.subtaskDrawerParentId
        );
        const allTasks = useSelector((state: RootState) => state.tasks.tasks);

        const subtasks = useMemo(() => {
            if (!parentTaskId) return [];

            const getFullTaskData = (taskId: string): Task | undefined => {
                const task = allTasks.find((t) => t._id === taskId);
                if (!task) return undefined;

                return {
                    ...task,
                    subtasks: task.subtasks
                        .map((subtaskId) =>
                            getFullTaskData(subtaskId as unknown as string)
                        )
                        .filter((t): t is Task => Boolean(t)),
                };
            };

            const parentTask = getFullTaskData(parentTaskId);
            return parentTask ? parentTask.subtasks : [];
        }, [allTasks, parentTaskId]);

        const parentTask = useMemo(() => {
            if (!parentTaskId) return null;
            return allTasks.find((t) => t._id === parentTaskId);
        }, [allTasks, parentTaskId]);

        const grandparentTask = useMemo(() => {
            if (!parentTask?.parentTask) return null;
            return allTasks.find((t) => t._id === parentTask?.parentTask);
        }, [allTasks, parentTask]);

        const handleSwitchParentTask = useCallback(
            (task: Task) => {
                dispatch(setSubtaskDrawerParentId(task._id ?? ''));
                // : dispatch(setSubtaskDrawerOpen(false));
            },
            [dispatch]
        );

        return (
            <div
                ref={ref}
                className={`fixed top-0 right-0 h-full bg-base-300 shadow-md transform w-[350px] ${
                    isOpen ? '' : 'translate-x-full'
                } transition-transform duration-300 ease-in-out subtask-drawer-items`}
            >
                <div className="p-3 subtask-drawer-items">
                    <div className="flex flex-row justify-between items-center py-2">
                        <h2 className="text-xl font-bold subtask-drawer-items">
                            Subtasks
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-red-500 flex items-center gap-1 subtask-drawer-items hover:text-white hover:bg-red-500 rounded-full transition-colors duration-300 p-1"
                        >
                            <FaXmark className="text-sm" />
                        </button>
                    </div>
                    <div className="flex flex-row gap-2 h-0.5 bg-base-100 w-full"></div>
                    <div className="flex flex-row items-center gap-2 pt-2 w-full text-sm text-slate-300">
                        {/* <span className="text-slate-700">Subtasks of</span> */}
                        {grandparentTask ? (
                            <>
                                <FaAngleRight className="text-sm text-slate-700" />
                                <p
                                    className="p-2 hover:text-white bg-sky-950 hover:bg-sky-800 rounded-md cursor-pointer max-w-28"
                                    onClick={() =>
                                        handleSwitchParentTask(
                                            grandparentTask as Task
                                        )
                                    }
                                >
                                    {grandparentTask?.taskName}
                                </p>
                                <FaAnglesRight className="text-sm text-slate-700" />
                            </>
                        ) : (
                            <FaAngleRight className="text-sm text-slate-700" />
                        )}
                        <>
                            <p
                                className="p-2 rounded-md cursor-pointer max-w-28"
                                onClick={() =>
                                    handleSwitchParentTask(parentTask as Task)
                                }
                            >
                                {parentTask?.taskName}
                            </p>
                        </>
                    </div>
                    <ul className="overflow-y-auto overflow-x-visible h-[calc(100vh-10rem)] subtask-drawer-items">
                        <SubtaskDropZone
                            index={0}
                            parentTask={parentTask as Task}
                        />
                        {subtasks.map((subtask) => (
                            <React.Fragment key={subtask?._id}>
                                <SubtaskDrawerCard
                                    subtask={subtask as Task}
                                    index={subtasks.indexOf(subtask)}
                                />
                                <SubtaskDropZone
                                    index={subtasks.indexOf(subtask) + 1}
                                    parentTask={parentTask as Task}
                                />
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }
);

SubtaskDrawer.displayName = 'SubtaskDrawer';

export default SubtaskDrawer;
