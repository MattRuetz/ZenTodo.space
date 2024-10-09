// src/components/Mobile/MobileEmojiFilter.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store/store';

import { updateSpaceSelectedEmojis } from '@/store/spaceSlice';

import { useTheme } from '@/hooks/useTheme';
import { selectAllTasks } from '@/store/selectors';

interface MobileEmojiFilterProps {
    spaceId: string;
}

export const MobileEmojiFilter: React.FC<MobileEmojiFilterProps> = React.memo(
    ({ spaceId }) => {
        const dispatch = useDispatch<AppDispatch>();
        const currentTheme = useTheme();

        // Memoized selectors
        const selectedEmojis = useSelector(
            (state: RootState) =>
                state.spaces.currentSpace?.selectedEmojis || []
        );

        const tasks = useSelector(selectAllTasks);

        const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);

        // Function to extract unique emojis from tasks
        const extractUniqueEmojis = (tasks: any[], spaceId: string) => {
            return Array.from(
                new Set(
                    tasks
                        .filter(
                            (task) => !task.parentTask && task.space === spaceId
                        )
                        .map((task) => task.emoji)
                        .filter(Boolean)
                )
            );
        };

        useEffect(() => {
            if (tasks.length > 0) {
                const uniqueEmojis = extractUniqueEmojis(tasks, spaceId);
                setAvailableEmojis(uniqueEmojis);
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

        // Early return if no available emojis
        if (availableEmojis.length === 0) {
            return null;
        }

        return (
            <div
                className="w-full p-2 border-b border-t"
                style={{
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
    }
);

export default MobileEmojiFilter;
