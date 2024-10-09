//src/components/TaskCards/DueDateIndicator.tsx
import React, { useMemo } from 'react';
import { FaHourglassHalf } from 'react-icons/fa';
import { FaHourglassEnd, FaHourglassStart } from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';

import { useIsMobileSize } from '@/hooks/useIsMobileSize';
import { useTheme } from '@/hooks/useTheme';

import { Task } from '@/types';
interface DueDateIndicatorProps {
    task: Task;
    handleDueDateClick: () => void;
}

export const DueDateIndicator: React.FC<DueDateIndicatorProps> = React.memo(
    ({ task, handleDueDateClick }) => {
        const currentTheme = useTheme();
        const isMobileSize = useIsMobileSize();

        const dueDate = new Date(task.dueDate as Date);
        const now = new Date();
        const todayString = now.toLocaleDateString();
        const dueDateString = dueDate.toLocaleDateString();

        const dueDateIsPast =
            dueDate.getTime() < now.getTime() && dueDateString !== todayString;
        const dueDateIsToday = dueDateString === todayString;
        const dueDateIsTomorrow =
            dueDateString ===
            new Date(now.setDate(now.getDate() + 1)).toLocaleDateString();

        const dueDateIsWithin7Days = useMemo(() => {
            const daysUntilDue =
                (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            return daysUntilDue > 0 && daysUntilDue <= 7;
        }, [dueDate, now]);

        const dayOfWeek = (date: Date) => {
            const daysOfWeek = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ];
            return daysOfWeek[date.getDay()];
        };

        const getDueDateColor = () => {
            if (dueDateIsPast) return `var(--${currentTheme}-accent-red)`;
            if (dueDateIsWithin7Days || dueDateIsToday)
                return `var(--${currentTheme}-accent-yellow)`;
            return `var(--${currentTheme}-text-subtle)`;
        };

        return (
            <div className="text-lg">
                <button
                    data-tooltip-id={`due-date-tooltip-${task._id}`}
                    className="btn btn-sm btn-ghost cursor-pointer flex items-center gap-2"
                    onClick={handleDueDateClick}
                >
                    {isMobileSize && task.dueDate && (
                        <p
                            className="hover:saturate-150 transition-colors duration-200 text-sm"
                            style={{ color: getDueDateColor() }}
                        >
                            {new Date(task.dueDate as Date).toLocaleDateString(
                                'en-US',
                                {
                                    month: 'short',
                                    day: 'numeric',
                                    year:
                                        new Date(
                                            task.dueDate as Date
                                        ).getFullYear() !==
                                        new Date().getFullYear()
                                            ? 'numeric'
                                            : undefined,
                                }
                            )}
                        </p>
                    )}
                    {dueDateIsPast ? (
                        <FaHourglassEnd
                            className="hover:saturate-150 transition-colors duration-200"
                            style={{
                                color: `var(--${currentTheme}-accent-red)`,
                            }}
                        />
                    ) : dueDateIsWithin7Days ? (
                        <FaHourglassHalf
                            className="hover:saturate-150 transition-colors duration-200"
                            style={{
                                color: `var(--${currentTheme}-accent-yellow)`,
                            }}
                        />
                    ) : dueDateIsToday ? (
                        <FaHourglassEnd
                            className="hover:saturate-150 transition-colors duration-200"
                            style={{
                                color: `var(--${currentTheme}-accent-yellow)`,
                            }}
                        />
                    ) : (
                        <FaHourglassStart
                            className="hover:saturate-150 transition-colors duration-200"
                            style={{
                                color: `var(--${currentTheme}-text-subtle)`,
                            }}
                        />
                    )}
                </button>
                <div className="text-base">
                    {!isMobileSize && (
                        <Tooltip
                            id={`due-date-tooltip-${task._id}`}
                            place="top"
                        >
                            {dueDateIsPast ? (
                                <>
                                    <strong className="underline">
                                        Past Due
                                    </strong>
                                    <br />
                                    {new Date(
                                        task.dueDate as Date
                                    ).toLocaleDateString()}
                                </>
                            ) : dueDateIsToday ? (
                                'Due Today'
                            ) : dueDateIsWithin7Days ? (
                                <>
                                    Due{' '}
                                    {dueDateIsTomorrow
                                        ? 'Tomorrow'
                                        : dayOfWeek(
                                              new Date(task.dueDate as Date)
                                          )}
                                    <br />
                                    {new Date(
                                        task.dueDate as Date
                                    ).toLocaleDateString()}
                                </>
                            ) : (
                                `Due ${new Date(
                                    task.dueDate as Date
                                ).toLocaleDateString()}`
                            )}
                        </Tooltip>
                    )}
                </div>
            </div>
        );
    }
);

export default DueDateIndicator;
