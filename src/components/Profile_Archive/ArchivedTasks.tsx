// src/components/Profile_Archive/ArchivedTasks.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import {
    FaArchive,
    FaExclamationTriangle,
    FaSearch,
    FaTasks,
    FaTrash,
} from 'react-icons/fa';

import { useTheme } from '@/hooks/useTheme';

import ArchivedTaskCard from './ArchivedTaskCard';
import ConfirmClearArchive from './ConfirmClearArchive';

import { RootState } from '@/store/store';
import { Task } from '@/types';

// Memoized selectors
const selectArchivedTasks = createSelector(
    (state: RootState) => state.tasks.tasks,
    (tasks) => tasks.filter((task: Task) => task.isArchived)
);

const selectSpaces = (state: RootState) => state.spaces.spaces;

const ArchivedTasks: React.FC = () => {
    const currentTheme = useTheme();

    const archivedTasks = useSelector(selectArchivedTasks);
    const spaces = useSelector(selectSpaces);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
    const [showConfirmClear, setShowConfirmClear] = useState(false);

    const filteredTasks = useMemo(() => {
        const lowercaseQuery = searchQuery.toLowerCase();
        return archivedTasks
            .filter((task: Task) =>
                task.taskName.toLowerCase().includes(lowercaseQuery)
            )
            .sort((a: Task, b: Task) => {
                if (sortBy === 'date') {
                    return (
                        new Date(b.archivedAt as Date).getTime() -
                        new Date(a.archivedAt as Date).getTime()
                    );
                } else {
                    return a.taskName.localeCompare(b.taskName);
                }
            });
    }, [searchQuery, archivedTasks, sortBy]);

    const handleClearArchiveClick = useCallback(() => {
        setShowConfirmClear(true);
    }, []);

    const cancelClearArchive = useCallback(() => {
        setShowConfirmClear(false);
    }, []);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value);
        },
        []
    );

    const handleSortChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSortBy(e.target.value as 'date' | 'name');
        },
        []
    );

    return (
        <div
            className="p-8 w-full rounded-lg py-8 sm:py-12 max-w-screen-md mx-auto"
            style={{ color: `var(--${currentTheme}-text-default)` }}
        >
            <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold bg-transparent flex items-center gap-2">
                    <FaArchive className="mr-2" />
                    Archived Tasks
                    <span className="text-xs text-gray-500">
                        {archivedTasks.length} tasks
                    </span>
                </h2>

                {archivedTasks.length > 0 && (
                    <button
                        className="btn btn-sm btn-outline"
                        onClick={handleClearArchiveClick}
                        style={{
                            color: `var(--${currentTheme}-text-default)`,
                        }}
                    >
                        <FaTrash className="mr-2" />
                        Delete All
                    </button>
                )}
                {showConfirmClear && (
                    <ConfirmClearArchive
                        cancelClearArchive={cancelClearArchive}
                        archivedTasksCount={archivedTasks.length}
                    />
                )}
            </div>
            <p className="flex items-center gap-2 text-sm text-gray-500">
                <FaExclamationTriangle className="text-yellow-300" />
                Tasks in archive will be deleted after 30 days
            </p>
            <div className="mb-6 space-y-4 h-full pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full p-2 pl-10 rounded-lg"
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-200)`,
                                border: `1px solid var(--${currentTheme}-card-border-color)`,
                            }}
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    <select
                        value={sortBy}
                        onChange={handleSortChange}
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: `var(--${currentTheme}-background-100)`,
                            border: `1px solid var(--${currentTheme}-card-border-color)`,
                        }}
                    >
                        <option value="date">Sort by Date Archived</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4 pb-10">
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 min-h-[200px] justify-center">
                        <FaSearch className="text-4xl" />
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
                    filteredTasks.map((task: Task) => (
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

export default React.memo(ArchivedTasks);
