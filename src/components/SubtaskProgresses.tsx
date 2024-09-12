import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '../store/uiSlice';
import { RootState } from '@/store/store';

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

        const isSubtaskDrawerOpen = useSelector(
            (state: RootState) => state.ui.isSubtaskDrawerOpen
        );

        const handleOpenDrawer = useCallback(() => {
            dispatch(setSubtaskDrawerParentId(parentTaskId));
            !isSubtaskDrawerOpen
                ? dispatch(setSubtaskDrawerOpen(true))
                : dispatch(setSubtaskDrawerOpen(false));
        }, [dispatch, parentTaskId, isSubtaskDrawerOpen]);

        const isVisible = Object.values(subtaskProgresses).some(
            (count) => count > 0
        );

        return (
            <div
                style={{
                    visibility: isVisible ? 'visible' : 'hidden',
                }}
                className="flex gap-1 bg-base-100 hover:bg-slate-800 transition-colors duration-200 rounded-full px-2 py-1 cursor-pointer items-center justify-center text-xs"
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
