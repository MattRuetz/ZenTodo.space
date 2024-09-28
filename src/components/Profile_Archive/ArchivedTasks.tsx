import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import {
    FaCheckCircle,
    FaCalendarAlt,
    FaTag,
    FaArchive,
    FaUndo,
} from 'react-icons/fa';
import { Icon } from '../Icon';
import { motion } from 'framer-motion';
import { SpaceData, Task } from '@/types';
import { AppDispatch, RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import { FaMagnifyingGlass, FaTrash } from 'react-icons/fa6';
import { useDeleteTask } from '@/hooks/useDeleteTask';
import { moveTaskToSpace } from '@/store/tasksSlice';
import { useDispatch } from 'react-redux';
import { ComponentSpinner } from '../ComponentSpinner';
import ArchivedTaskCard from './ArchivedTaskCard';

// Temporary type for archived tasks
type ArchivedTask = {
    id: string;
    name: string;
    completedDate: string;
    space: string;
    emoji: string;
};

const ArchivedTasks: React.FC = () => {
    const currentTheme = useTheme();

    const archivedTasks = useSelector((state: RootState) =>
        state.tasks.tasks.filter((task: Task) => task.isArchived)
    );
    const spaces = useSelector((state: RootState) => state.spaces.spaces);

    return (
        <div
            className="p-6 h-full w-full rounded-lg py-12 max-w-screen-md mx-auto"
            style={{
                color: `var(--${currentTheme}-text-default)`,
            }}
        >
            <h2 className="text-2xl font-bold mb-6 bg-transparent flex items-center gap-2">
                <FaArchive className="mr-2" />
                Archived Tasks
            </h2>
            <div className="space-y-4 pb-10">
                {archivedTasks.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 min-h-[200px] justify-center">
                        <FaMagnifyingGlass className="text-4xl" />
                        <div
                            className="text-center text-sm"
                            style={{
                                color: `var(--${currentTheme}-text-subtle)`,
                            }}
                        >
                            No archived tasks found.
                        </div>
                    </div>
                ) : (
                    archivedTasks.map((task: Task) => (
                        <ArchivedTaskCard
                            key={task._id}
                            task={task}
                            spaces={spaces}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default ArchivedTasks;
