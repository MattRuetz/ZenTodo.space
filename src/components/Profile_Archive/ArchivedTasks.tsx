import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { FaArchive, FaFilter, FaSearch } from 'react-icons/fa';
import { SpaceData, Task } from '@/types';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
import ArchivedTaskCard from './ArchivedTaskCard';

const ArchivedTasks: React.FC = () => {
    const currentTheme = useTheme();

    const archivedTasks = useSelector((state: RootState) =>
        state.tasks.tasks.filter((task: Task) => task.isArchived)
    );
    const spaces = useSelector((state: RootState) => state.spaces.spaces);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

    const filteredTasks = useMemo(() => {
        let filtered = archivedTasks.filter((task: Task) =>
            task.taskName.toLowerCase().includes(searchQuery.toLowerCase())
        );

        filtered.sort((a: Task, b: Task) => {
            if (sortBy === 'date') {
                return (
                    +new Date(b.archivedAt || 0).getTime() -
                    new Date(a.archivedAt || 0).getTime()
                );
            } else {
                return a.taskName.localeCompare(b.taskName);
            }
        });

        return filtered;
    }, [searchQuery, archivedTasks, sortBy]);

    return (
        <div
            className="p-4 sm:p-6 w-full rounded-lg py-8 sm:py-12 max-w-screen-md mx-auto"
            style={{
                color: `var(--${currentTheme}-text-default)`,
            }}
        >
            <h2 className="text-xl sm:text-2xl font-bold mb-6 bg-transparent flex items-center gap-2">
                <FaArchive className="mr-2" />
                Archived Tasks
            </h2>
            <div className="mb-6 space-y-4 h-full">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
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
                        onChange={(e) =>
                            setSortBy(e.target.value as 'date' | 'name')
                        }
                        className="p-2 rounded-lg"
                        style={{
                            backgroundColor: `var(--${currentTheme}-background-100)`,
                            border: `1px solid var(--${currentTheme}-card-border-color)`,
                        }}
                    >
                        <option value="date">Sort by Date</option>
                        <option value="name">Sort by Name</option>
                    </select>
                </div>
            </div>
            <div className="space-y-4 pb-10">
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 min-h-[200px]  justify-center">
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

export default ArchivedTasks;
