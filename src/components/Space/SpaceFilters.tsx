// src/components/Space/SpaceFilters.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import {
    updateSpaceSelectedProgresses,
    updateSpaceSelectedDueDateRange,
    updateSpaceSelectedEmojis,
} from '@/store/spaceSlice';
import { FaFilter, FaX } from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { useTheme } from '@/hooks/useTheme';
import { SpaceData, TaskProgress } from '@/types';
import { createSelector } from '@reduxjs/toolkit';

// Memoized selectors
const selectTasks = createSelector(
    (state: RootState) => state.tasks.tasks,
    (tasks) => tasks.filter((task) => !task.parentTask)
);

const SpaceFilters: React.FC<{ spaceId: string }> = React.memo(
    ({ spaceId }) => {
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useTheme();
        const isMobileSize = useIsMobileSize();

        const tasks = useSelector(selectTasks);
        const currentSpace = useSelector(
            (state: RootState) => state.spaces.currentSpace
        );

        const selectedProgresses = currentSpace?.selectedProgresses || [];
        const selectedDueDateRange = currentSpace?.selectedDueDateRange || null;
        const selectedEmojis = currentSpace?.selectedEmojis || [];

        const [isOpen, setIsOpen] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);
        const filterRef = useRef<HTMLDivElement>(null);

        const progressOptions: TaskProgress[] = [
            'Not Started',
            'In Progress',
            'Blocked',
            'Complete',
        ];
        const dueDateOptions = ['today', 'next 7 days', 'next 30 days'];

        const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);

        useEffect(() => {
            if (tasks.length > 0) {
                const nonChildCards = tasks.filter(
                    (task) => !task.parentTask && task.space === spaceId
                );
                const uniqueEmojis = Array.from(
                    new Set(
                        nonChildCards.map((task) => task.emoji).filter(Boolean)
                    )
                );
                setAvailableEmojis(uniqueEmojis as string[]);
            }
        }, [tasks, spaceId]);

        const toggleProgress = useCallback(
            (progress: TaskProgress) => {
                const newSelectedProgresses = selectedProgresses.includes(
                    progress
                )
                    ? selectedProgresses.filter((p) => p !== progress)
                    : [...selectedProgresses, progress];

                dispatch(
                    updateSpaceSelectedProgresses({
                        spaceId,
                        selectedProgresses: newSelectedProgresses,
                    })
                );
            },
            [dispatch, selectedProgresses, spaceId]
        );

        const toggleEmoji = useCallback(
            (emoji: string) => {
                const newSelectedEmojis = selectedEmojis.includes(emoji)
                    ? selectedEmojis.filter((e) => e !== emoji)
                    : [...selectedEmojis, emoji];

                dispatch(
                    updateSpaceSelectedEmojis({
                        spaceId,
                        selectedEmojis: newSelectedEmojis,
                    })
                );
            },
            [dispatch, selectedEmojis, spaceId]
        );

        const setDueDateRange = useCallback(
            (range: string | null) => {
                dispatch(
                    updateSpaceSelectedDueDateRange({
                        spaceId,
                        selectedDueDateRange: range,
                    })
                );
            },
            [dispatch, spaceId]
        );

        const clearFilters = useCallback(() => {
            dispatch(
                updateSpaceSelectedProgresses({
                    spaceId,
                    selectedProgresses: [],
                })
            );
            dispatch(
                updateSpaceSelectedDueDateRange({
                    spaceId,
                    selectedDueDateRange: null,
                })
            );
            dispatch(
                updateSpaceSelectedEmojis({ spaceId, selectedEmojis: [] })
            );
        }, [dispatch, spaceId]);

        // Close the filter when clicking outside of it
        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (
                    buttonRef.current &&
                    !buttonRef.current.contains(event.target as Node) &&
                    filterRef.current &&
                    !filterRef.current.contains(event.target as Node)
                ) {
                    setIsOpen(false);
                }
            };

            window.addEventListener('mousedown', handleClickOutside);
            return () =>
                window.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const isFiltersActive =
            selectedProgresses.length > 0 ||
            selectedDueDateRange !== null ||
            selectedEmojis.length > 0;

        return (
            <div className="relative w-full">
                <button
                    ref={buttonRef}
                    data-tooltip-id="space-filters-tooltip"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 border border-black`}
                    style={{
                        backgroundColor: isFiltersActive
                            ? `var(--${currentTheme}-accent-blue)`
                            : isMobileSize
                            ? `transparent`
                            : `var(--${currentTheme}-background-200)`,
                        color: `var(--${currentTheme}-text-default)`,
                    }}
                >
                    <FaFilter />
                </button>
                {!isMobileSize && (
                    <Tooltip id="space-filters-tooltip">
                        <div className="bg-transparent font-normal text-sm text-left text-white">
                            Filter tasks
                        </div>
                    </Tooltip>
                )}

                {isOpen && (
                    <div
                        ref={filterRef}
                        className="absolute top-0 left-full ml-2 p-3 rounded-lg shadow-lg z-50 w-96 opacity-90 border border-black"
                        style={{
                            top: buttonRef.current
                                ? buttonRef.current.offsetTop
                                : 0,
                            backgroundColor: `var(--${currentTheme}-background-200)`,
                        }}
                    >
                        {/* Progress */}
                        <div className="mb-4">
                            <h3
                                className="text-sm font-semibold mb-2"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            >
                                Progress
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {progressOptions.map((progress) => (
                                    <button
                                        key={progress}
                                        onClick={() => toggleProgress(progress)}
                                        className={`text-xs btn btn-outline transition-colors duration-200 col-span-1`}
                                        style={{
                                            backgroundColor:
                                                selectedProgresses.includes(
                                                    progress
                                                )
                                                    ? `var(--${currentTheme}-accent-blue)`
                                                    : 'transparent',
                                            color: selectedProgresses.includes(
                                                progress
                                            )
                                                ? `var(--${currentTheme}-text-default)`
                                                : `var(--${currentTheme}-text-subtle)`,
                                        }}
                                    >
                                        {progress}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Due Date */}
                        <div className="mb-4">
                            <h3
                                className="text-sm font-semibold mb-2"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            >
                                Due Date
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                {dueDateOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() =>
                                            setDueDateRange(
                                                selectedDueDateRange === option
                                                    ? null
                                                    : option
                                            )
                                        }
                                        className={`text-xs btn btn-outline transition-colors duration-200 col-span-1`}
                                        style={{
                                            backgroundColor:
                                                selectedDueDateRange === option
                                                    ? `var(--${currentTheme}-accent-blue)`
                                                    : 'transparent',
                                            color:
                                                selectedDueDateRange === option
                                                    ? `var(--${currentTheme}-text-default)`
                                                    : `var(--${currentTheme}-text-subtle)`,
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Emoji */}
                        <div className="mb-4">
                            <h3
                                className="text-sm font-semibold mb-2"
                                style={{
                                    color: `var(--${currentTheme}-text-default)`,
                                }}
                            >
                                Emojis
                            </h3>
                            <div className="overflow-x-auto overflow-y-hidden w-full pb-2 scrollbar-rounded-full">
                                <div className="flex gap-2">
                                    {availableEmojis.length === 0 && (
                                        <div className="text-sm text-gray-500">
                                            No emojis set for main tasks
                                        </div>
                                    )}
                                    {availableEmojis.map((emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => toggleEmoji(emoji)}
                                            className={`text-lg btn btn-circle transition-colors duration-200`}
                                            style={{
                                                backgroundColor:
                                                    selectedEmojis.includes(
                                                        emoji
                                                    )
                                                        ? `var(--${currentTheme}-accent-blue)`
                                                        : `var(--${currentTheme}-background-100)`,
                                                color: selectedEmojis.includes(
                                                    emoji
                                                )
                                                    ? `var(--${currentTheme}-text-default)`
                                                    : `var(--${currentTheme}-text-subtle)`,
                                            }}
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {isFiltersActive && (
                            <div
                                className="mt-2 pt-2"
                                style={{
                                    borderTop: `1px solid var(--${currentTheme}-accent-grey)`,
                                }}
                            >
                                <button
                                    onClick={clearFilters}
                                    className="btn btn-sm btn-outline btn-error text-xs px-2 py-1 rounded transition-colors duration-200"
                                >
                                    <FaX /> Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

export default SpaceFilters;
