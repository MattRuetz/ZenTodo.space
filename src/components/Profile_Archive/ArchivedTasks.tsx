import React from 'react';
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

// Temporary type for archived tasks
type ArchivedTask = {
    id: string;
    name: string;
    completedDate: string;
    space: string;
    emoji: string;
};

const ArchivedTasks: React.FC = () => {
    const theme = useTheme();

    // Temporary array of archived tasks
    const archivedTasks: ArchivedTask[] = [
        {
            id: '1',
            name: 'Complete project proposal',
            completedDate: '2023-05-15',
            space: 'Work',
            emoji: '🚀',
        },
        {
            id: '2',
            name: 'Buy groceries',
            completedDate: '2023-05-14',
            space: 'Personal',
            emoji: '🛍️',
        },
        {
            id: '3',
            name: 'Plan vacation',
            completedDate: '2023-05-13',
            space: 'Travel',
            emoji: '🌴',
        },
        {
            id: '4',
            name: 'Finish reading book',
            completedDate: '2023-05-12',
            space: 'Personal',
            emoji: '📚',
        },
        {
            id: '5',
            name: 'Prepare presentation',
            completedDate: '2023-05-11',
            space: 'Work',
            emoji: '📝',
        },
    ];

    return (
        <div className="p-6 h-full w-full rounded-lg py-12 max-w-screen-md mx-auto">
            <h2 className="text-2xl font-bold mb-6 bg-transparent flex items-center gap-2">
                <FaArchive className="mr-2" />
                Archived Tasks
            </h2>
            <div className="space-y-4 pb-10">
                {archivedTasks.map((task) => (
                    <div
                        key={task.id}
                        className="p-4 rounded-lg shadow-md"
                        style={{
                            backgroundColor: `var(--${theme}-background-200)`,
                        }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex items-center justify-center w-12 h-12 rounded-full"
                                    style={{
                                        backgroundColor: `var(--${theme}-background-100)`,
                                    }}
                                >
                                    <span className="text-2xl">
                                        {task.emoji || <FaTag />}
                                    </span>
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <span className="font-semibold text-lg">
                                        {task.name}
                                    </span>
                                    <div
                                        className="flex items-center space-x-2 text-sm py-1 px-2 rounded-lg w-fit"
                                        style={{
                                            backgroundColor: `var(--${theme}-background-100)`,
                                        }}
                                    >
                                        <span>{task.space}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-rows-2 gap-2">
                                <div className="p-1 flex items-center space-x-2 text-sm">
                                    <FaCalendarAlt
                                        style={{
                                            color: `var(--${theme}-text-default)`,
                                        }}
                                    />
                                    <span>{task.completedDate}</span>
                                </div>
                                <button
                                    className="p-1 rounded-lg btn-ghost text-sm flex items-center align-start gap-2"
                                    style={{
                                        color: `var(--${theme}-text-subtle)`,
                                    }}
                                >
                                    <FaUndo />
                                    Recover Task
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArchivedTasks;
