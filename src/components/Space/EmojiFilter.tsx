// src/components/Space/EmojiFilter.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaFilter, FaX } from 'react-icons/fa6';
import { AppDispatch, RootState } from '@/store/store';
import { updateSpaceSelectedEmojis } from '@/store/spaceSlice';
import { fetchTasks } from '@/store/tasksSlice';
import { Tooltip } from 'react-tooltip';
import { useTheme } from '@/hooks/useTheme';

interface EmojiFilterProps {
    clearSelectedEmojis: () => void;
    spaceId: string;
}

export const EmojiFilter: React.FC<EmojiFilterProps> = ({
    clearSelectedEmojis,
    spaceId,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const currentTheme = useTheme();
    const selectedEmojis = useSelector(
        (state: RootState) => state.spaces.currentSpace?.selectedEmojis || []
    );
    const [isOpen, setIsOpen] = useState(false);
    const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

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
    }, [tasks]);

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

    // Close the emoji filter when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                data-tooltip-id="emoji-filter-tooltip"
                onClick={() => {
                    if (availableEmojis.length > 0) {
                        setIsOpen(!isOpen);
                    }
                }}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-200 border border-black`}
                style={{
                    backgroundColor:
                        selectedEmojis.length > 0
                            ? `var(--${currentTheme}-accent-blue)`
                            : `var(--${currentTheme}-background-200)`,
                    color:
                        selectedEmojis.length > 0
                            ? `var(--${currentTheme}-text-default)`
                            : `var(--${currentTheme}-text-subtle)`,
                }}
            >
                <FaFilter />
            </button>
            <Tooltip id="emoji-filter-tooltip">
                <div className="bg-transparent font-normal text-sm text-left text-white">
                    {availableEmojis.length === 0
                        ? 'No emojis in this space'
                        : 'Filter by emoji'}
                </div>
            </Tooltip>

            {isOpen && (
                <div
                    className="absolute top-0 left-full ml-2 p-2 rounded-lg shadow-lg z-50 max-w-96"
                    style={{
                        top: buttonRef.current
                            ? buttonRef.current.offsetTop
                            : 0,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        backgroundColor: `var(--${currentTheme}-background-300)`,
                    }}
                >
                    <div className="flex gap-2 flex-row w-full">
                        {availableEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => toggleEmoji(emoji)}
                                className={`text-2xl rounded p-1 transition-colors duration-200 w-full`}
                                style={{
                                    backgroundColor: selectedEmojis.includes(
                                        emoji
                                    )
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
                    {selectedEmojis.length > 0 && (
                        <div
                            className="mt-2 pt-2"
                            style={{
                                borderTop: `1px solid var(--${currentTheme}-accent-grey)`,
                            }}
                        >
                            <div className="flex justify-between items-center mb-1 gap-2">
                                <p
                                    className="text-sm font-semibold"
                                    style={{
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                >
                                    Selected:
                                </p>
                                <button
                                    onClick={clearSelectedEmojis}
                                    className="text-xs px-2 py-1 rounded transition-colors duration-200"
                                    style={{
                                        backgroundColor: `var(--${currentTheme}-accent-red)`,
                                        color: `var(--${currentTheme}-text-default)`,
                                    }}
                                >
                                    Clear
                                </button>
                            </div>
                            <div className="flex gap-1">
                                {selectedEmojis.map((emoji, index) => (
                                    <span key={index} className="text-lg">
                                        {emoji}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
