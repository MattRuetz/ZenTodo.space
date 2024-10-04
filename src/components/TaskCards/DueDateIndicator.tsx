import { useTheme } from '@/hooks/useTheme';
import { Task } from '@/types';
import { isMobile } from 'react-device-detect';
import { FaClock, FaExclamationCircle, FaHourglassHalf } from 'react-icons/fa';
import { FaHourglassEnd, FaHourglassStart } from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';

export const DueDateIndicator = ({
    task,
    handleDueDateClick,
}: {
    task: Task;
    handleDueDateClick: () => void;
}) => {
    const currentTheme = useTheme();
    const dueDateIsPast =
        new Date(task.dueDate as Date).getTime() < new Date().getTime() &&
        new Date(task.dueDate as Date).toLocaleDateString() !==
            new Date().toLocaleDateString();

    const dueDateIsToday =
        new Date(task.dueDate as Date).toLocaleDateString() ===
        new Date().toLocaleDateString();

    const dueDateIsTomorrow =
        new Date(task.dueDate as Date).toLocaleDateString() ===
        new Date(
            new Date().setDate(new Date().getDate() + 1)
        ).toLocaleDateString();

    let dueDateIsWithin7Days = false;
    if (!dueDateIsToday) {
        const dueDate = new Date(task.dueDate as Date);
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        dueDateIsWithin7Days =
            dueDate.getTime() - today.getTime() <= 6 * 24 * 60 * 60 * 1000;
    }

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

    return (
        <>
            <div className={'text-lg'}>
                <button
                    data-tooltip-id={`due-date-tooltip-${task._id}`}
                    className="btn btn-sm btn-ghost cursor-pointer flex items-center gap-2"
                    onClick={handleDueDateClick}
                >
                    {isMobile && task.dueDate && (
                        <p
                            className="hover:saturate-150 transition-colors duration-200 text-sm"
                            style={{
                                color: dueDateIsPast
                                    ? `var(--${currentTheme}-accent-red)`
                                    : dueDateIsWithin7Days || dueDateIsToday
                                    ? `var(--${currentTheme}-accent-yellow)`
                                    : `var(--${currentTheme}-text-subtle)`,
                            }}
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
                                color: `var(--${currentTheme}-accent-yellow)`, // Use theme color for due this week
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
                    <Tooltip id={`due-date-tooltip-${task._id}`} place="top">
                        {dueDateIsPast ? (
                            <>
                                <strong className="underline">Past Due</strong>
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
                                    : dayOfWeek(new Date(task.dueDate as Date))}
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
                </div>
            </div>
        </>
    );
};
