import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';
import { updateSpaceSelectedEmojis } from '@/store/spaceSlice';
import { fetchTasks } from '@/store/tasksSlice';
import { useTheme } from '@/hooks/useTheme';
import { FaFilter } from 'react-icons/fa';

interface MobileEmojiFilterProps {
    spaceId: string;
}

export const MobileEmojiFilter: React.FC<MobileEmojiFilterProps> = ({
    spaceId,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const selectedEmojis = useSelector(
        (state: RootState) => state.spaces.currentSpace?.selectedEmojis || []
    );
    const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);

    const tasks = useSelector((state: RootState) => state.tasks.tasks);

    useEffect(() => {
        if (tasks.length > 0) {
            const nonChildCards = tasks.filter(
                (task) => !task.parentTask && task.space === spaceId
            );
            const uniqueEmojis = Array.from(
                new Set(nonChildCards.map((task) => task.emoji).filter(Boolean))
            );
            setAvailableEmojis(uniqueEmojis.filter(Boolean) as string[]);
        }
    }, [tasks, spaceId]);

    const toggleEmoji = (emoji: string) => {
        const newSelectedEmojis = selectedEmojis.includes(emoji)
            ? selectedEmojis.filter((e) => e !== emoji)
            : [...selectedEmojis, emoji];

        if (spaceId) {
            dispatch(
                updateSpaceSelectedEmojis({
                    spaceId,
                    selectedEmojis: newSelectedEmojis,
                })
            );
        }
    };

    return (
        <div
            className="w-full p-2 border-b border-t"
            style={{
                display: availableEmojis.length > 0 ? 'block' : 'none',
                borderColor: `var(--${currentTheme}-background-200)`,
                backgroundColor: `var(--${currentTheme}-background-100)`,
            }}
        >
            <div
                className="flex w-full space-x-2 px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-400 p-1 rounded-lg"
                style={{
                    backgroundColor: `var(--${currentTheme}-background-200)`,
                }}
            >
                {availableEmojis.map((emoji, index) => (
                    <button
                        key={index}
                        onClick={() => toggleEmoji(emoji)}
                        className={`text-lg p-1 rounded-full transition-colors duration-200 flex-shrink-0`}
                        style={{
                            backgroundColor: selectedEmojis.includes(emoji)
                                ? `var(--${currentTheme}-accent-blue)`
                                : 'transparent',
                            color: selectedEmojis.includes(emoji)
                                ? `var(--${currentTheme}-text-default)`
                                : `var(--${currentTheme}-text-subtle)`,
                        }}
                    >
                        {emoji}
                    </button>
                ))}
            </div>
        </div>
    );
};
