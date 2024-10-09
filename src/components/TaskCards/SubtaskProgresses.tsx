// src/components/TaskCards/SubtaskProgresses.tsx
import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    setSubtaskDrawerOpen,
    setSubtaskDrawerParentId,
} from '../../store/uiSlice';
import { Tooltip } from 'react-tooltip';
import { motion } from 'framer-motion';

import { useTheme } from '@/hooks/useTheme';

import { Task } from '@/types';
import { selectTasksByIds } from '@/store/selectors';

export interface SubtaskProgressesProps {
    task: Task;
}

const SubtaskProgresses: React.FC<SubtaskProgressesProps> = React.memo(
    ({ task }) => {
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useTheme();

        const subtasks = useSelector((state: RootState) =>
            selectTasksByIds(state, task.subtasks)
        );
        const isSubtaskDrawerOpen = useSelector(
            (state: RootState) => state.ui.isSubtaskDrawerOpen
        );

        const handleOpenDrawer = useCallback(() => {
            dispatch(setSubtaskDrawerParentId(task._id ?? ''));
            if (!isSubtaskDrawerOpen) {
                dispatch(setSubtaskDrawerOpen(true));
            }
        }, [dispatch, task._id, isSubtaskDrawerOpen]);

        const subtaskProgresses = useMemo(() => {
            return subtasks.reduce(
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
        }, [subtasks]);

        return (
            <>
                {task.subtasks.length > 0 && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -10,
                            scale: 0.8,
                            filter: 'brightness(8)',
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: 'brightness(1)',
                        }}
                        exit={{
                            opacity: 0,
                            y: 10,
                            scale: 0.8,
                            filter: 'brightness(8)',
                        }}
                        transition={{ duration: 0.2 }}
                        data-tooltip-id={`${task._id}-subtask-progresses-tooltip`}
                        style={{ zIndex: 1 }}
                    >
                        <div
                            className={`flex gap-2 ${
                                task.parentTask ? 'bg-base-300' : 'bg-base-100'
                            } hover:bg-slate-800 transition-colors duration-200 rounded-full cursor-pointer items-center justify-center text-xs h-8 px-2 max-w-5/12`}
                            onClick={handleOpenDrawer}
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-200)`,
                            }}
                        >
                            {subtaskProgresses.notStarted > 0 && (
                                <div
                                    className="subtask-count rounded-full flex items-center justify-center w-4 h-4 font-bold"
                                    style={{
                                        color: `var(--${currentTheme}-not-started-text)`,
                                        backgroundColor: `var(--${currentTheme}-not-started-background)`,
                                    }}
                                >
                                    {subtaskProgresses.notStarted}
                                </div>
                            )}
                            {subtaskProgresses.inProgress > 0 && (
                                <div
                                    className="subtask-count rounded-full flex items-center justify-center w-4 h-4 font-bold"
                                    style={{
                                        color: `var(--${currentTheme}-in-progress-text)`,
                                        backgroundColor: `var(--${currentTheme}-in-progress-background)`,
                                    }}
                                >
                                    {subtaskProgresses.inProgress}
                                </div>
                            )}
                            {subtaskProgresses.blocked > 0 && (
                                <div
                                    className="subtask-count rounded-full flex items-center justify-center w-4 h-4 font-bold"
                                    style={{
                                        color: `var(--${currentTheme}-blocked-text)`,
                                        backgroundColor: `var(--${currentTheme}-blocked-background)`,
                                    }}
                                >
                                    {subtaskProgresses.blocked}
                                </div>
                            )}
                            {subtaskProgresses.complete > 0 && (
                                <div
                                    className="subtask-count rounded-full flex items-center justify-center w-4 h-4 font-bold"
                                    style={{
                                        color: `var(--${currentTheme}-complete-text)`,
                                        backgroundColor: `var(--${currentTheme}-complete-background)`,
                                    }}
                                >
                                    {subtaskProgresses.complete}
                                </div>
                            )}
                            <Tooltip
                                id={`${task._id}-subtask-progresses-tooltip`}
                                style={{ zIndex: 100000 }}
                                place="top"
                            >
                                Subtasks
                            </Tooltip>
                        </div>
                    </motion.div>
                )}
            </>
        );
    }
);

export default SubtaskProgresses;
