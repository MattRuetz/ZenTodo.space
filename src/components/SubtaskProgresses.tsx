import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '../store/uiSlice';
import { RootState } from '@/store/store';
import { Task } from '@/types';

export interface SubtaskProgressesProps {
    task: Task;
}

const SubtaskProgresses: React.FC<SubtaskProgressesProps> = React.memo(
    ({ task }) => {
        const dispatch = useDispatch();

        const isSubtaskDrawerOpen = useSelector(
            (state: RootState) => state.ui.isSubtaskDrawerOpen
        );

        const handleOpenDrawer = useCallback(() => {
            dispatch(setSubtaskDrawerParentId(task._id ?? ''));
            !isSubtaskDrawerOpen && dispatch(setSubtaskDrawerOpen(true));
            // : dispatch(setSubtaskDrawerOpen(false));
        }, [dispatch, task._id, isSubtaskDrawerOpen]);

        const subtaskProgresses = useMemo(() => {
            return task.subtasks.reduce(
                (acc, subtask) => {
                    if (subtask) {
                        switch (subtask.progress) {
                            case 'Not Started':
                                acc.notStarted++;
                                break;
                            case 'In Progress':
                                acc.inProgress++;
                                break;
                            case 'Blocked':
                                acc.blocked++;
                                break;
                            case 'Complete':
                                acc.complete++;
                                break;
                        }
                    }
                    return acc;
                },
                {
                    notStarted: 0,
                    inProgress: 0,
                    blocked: 0,
                    complete: 0,
                }
            );
        }, [task.subtasks]);

        const isVisible = Object.values(subtaskProgresses).some(
            (count) => count > 0
        );

        return (
            <div
                style={{
                    visibility: isVisible ? 'visible' : 'hidden',
                }}
                className={`flex gap-2 ${
                    task.parentTask ? 'bg-base-300' : 'bg-base-100'
                } hover:bg-slate-800 transition-colors duration-200 rounded-full cursor-pointer items-center justify-center text-xs h-8 px-2 hover:font-bold`}
                onClick={handleOpenDrawer}
            >
                {subtaskProgresses.notStarted > 0 && (
                    <div className="subtask-count text-gray-400 rounded-full flex items-center justify-center w-4 h-4">
                        {subtaskProgresses.notStarted}
                    </div>
                )}
                {subtaskProgresses.inProgress > 0 && (
                    <div className="subtask-count text-yellow-400 rounded-full flex items-center justify-center w-4 h-4">
                        {subtaskProgresses.inProgress}
                    </div>
                )}
                {subtaskProgresses.blocked > 0 && (
                    <div className="subtask-count text-red-400 rounded-full flex items-center justify-center w-4 h-4">
                        {subtaskProgresses.blocked}
                    </div>
                )}
                {subtaskProgresses.complete > 0 && (
                    <div className="subtask-count text-green-400 rounded-full flex items-center justify-center w-4 h-4">
                        {subtaskProgresses.complete}
                    </div>
                )}
            </div>
        );
    }
);

export default SubtaskProgresses;
