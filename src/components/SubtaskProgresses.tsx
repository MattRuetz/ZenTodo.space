import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '../store/uiSlice';

export interface SubtaskProgressesProps {
    subtaskProgresses: {
        notStarted: number;
        inProgress: number;
        blocked: number;
        complete: number;
    };
    parentTaskId: string;
}

const SubtaskProgresses: React.FC<SubtaskProgressesProps> = React.memo(
    ({ subtaskProgresses, parentTaskId }) => {
        const dispatch = useDispatch();

        const handleOpenDrawer = useCallback(() => {
            dispatch(setSubtaskDrawerParentId(parentTaskId));
            dispatch(setSubtaskDrawerOpen(true));
        }, [dispatch, parentTaskId]);

        return (
            <div
                className="flex items-center gap-2 bg-slate-900 rounded-full p-2 cursor-pointer"
                onClick={handleOpenDrawer}
            >
                {subtaskProgresses.notStarted > 0 && (
                    <div className="subtask-count bg-gray-200 text-gray-700 rounded-full px-2 py-1 text-xs">
                        {subtaskProgresses.notStarted}
                    </div>
                )}
                {subtaskProgresses.inProgress > 0 && (
                    <div className="subtask-count bg-yellow-400 text-gray-700 rounded-full px-2 py-1 text-xs">
                        {subtaskProgresses.inProgress}
                    </div>
                )}
                {subtaskProgresses.blocked > 0 && (
                    <div className="subtask-count bg-red-500 text-gray-700 rounded-full px-2 py-1 text-xs">
                        {subtaskProgresses.blocked}
                    </div>
                )}
                {subtaskProgresses.complete > 0 && (
                    <div className="subtask-count bg-green-500 text-gray-700 rounded-full px-2 py-1 text-xs">
                        {subtaskProgresses.complete}
                    </div>
                )}
            </div>
        );
    }
);

export default SubtaskProgresses;
