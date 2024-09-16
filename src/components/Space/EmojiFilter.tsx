// src/components/Space/EmojiFilter.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaFilter, FaX } from 'react-icons/fa6';
import { AppDispatch, RootState } from '@/store/store';
import { updateSpaceSelectedEmojis } from '@/store/spaceSlice';
import { fetchTasks } from '@/store/tasksSlice';

export const EmojiFilter: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const spaceId = useSelector(
        (state: RootState) => state.spaces.currentSpace?._id
    );
    const selectedEmojis = useSelector(
        (state: RootState) => state.spaces.currentSpace?.selectedEmojis || []
    );
    const [isOpen, setIsOpen] = useState(false);
    const [availableEmojis, setAvailableEmojis] = useState<string[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const tasks = useSelector((state: RootState) => state.tasks.tasks);

    useEffect(() => {
        if (tasks.length > 0) {
            const nonChildCards = tasks.filter((task) => !task.parentTask);
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

    const clearSelectedEmojis = () => {
        if (spaceId) {
            dispatch(
                updateSpaceSelectedEmojis({
                    spaceId,
                    selectedEmojis: [],
                })
            );
        }
    };

    return (
        <div className="relative inline-block">
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-center w-8 h-8 bg-base-200 hover:bg-base-300 rounded-full transition-colors duration-200 ${
                    selectedEmojis.length > 0
                        ? 'bg-yellow-600 text-black hover:bg-yellow-400'
                        : ''
                }`}
            >
                <FaFilter />
            </button>

            {isOpen && (
                <div
                    className="absolute top-0 left-full ml-2 p-2 rounded-lg bg-slate-800 shadow-lg z-50 max-w-96"
                    style={{
                        top: buttonRef.current
                            ? buttonRef.current.offsetTop
                            : 0,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}
                >
                    <div className="flex gap-2 flex-row w-full">
                        {availableEmojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => toggleEmoji(emoji)}
                                className={`text-2xl hover:bg-base-200 rounded p-1 transition-colors duration-200 w-full ${
                                    selectedEmojis.includes(emoji)
                                        ? 'bg-primary text-primary-content'
                                        : ''
                                }`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    {selectedEmojis.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-base-300">
                            <div className="flex justify-between items-center mb-1">
                                <p className="text-sm font-semibold">
                                    Selected:
                                </p>
                                <button
                                    onClick={clearSelectedEmojis}
                                    className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors duration-200"
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
