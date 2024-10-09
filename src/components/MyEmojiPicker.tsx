// src/components/MyEmojiPicker.tsx
import Picker from '@emoji-mart/react';
import { useEffect, useCallback } from 'react';
import { FaTrash, FaX } from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';

interface MyEmojiPickerProps {
    setTaskEmoji?: (emoji: string) => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const MyEmojiPicker: React.FC<MyEmojiPickerProps> = ({
    setTaskEmoji,
    setIsOpen,
}) => {
    const currentTheme = useTheme();

    // useEffect to close the emoji picker when the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const emojiPicker = document.querySelector(
                '.emoji-picker-container'
            );
            if (
                emojiPicker &&
                e.target instanceof Node &&
                !emojiPicker.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    const handleNoEmojiClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (setTaskEmoji) {
                setTaskEmoji('');
                setIsOpen(false);
            }
        },
        [setTaskEmoji, setIsOpen]
    );

    const handleCloseClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsOpen(false);
        },
        [setIsOpen]
    );

    const handleEmojiSelect = useCallback(
        (emoji: any) => {
            if (setTaskEmoji) {
                setTaskEmoji(emoji.native);
            }
            setIsOpen(false);
        },
        [setTaskEmoji, setIsOpen]
    );

    return (
        <div
            className="emoji-picker-container p-2 rounded-lg shadow-md w-full"
            style={{
                backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
            }}
        >
            <div className="flex flex-row justify-between pb-2">
                <button
                    className="flex items-center gap-2 text-sm btn btn-error btn-sm"
                    style={{
                        color: `var(--${currentTheme}-text-default)`, // Use theme color
                    }}
                    onClick={handleNoEmojiClick}
                >
                    <FaTrash
                        className="w-4 h-4"
                        style={{ color: `var(--${currentTheme}-text-default)` }}
                    />{' '}
                    {/* Use theme color */}
                    No Emoji
                </button>
                <button
                    className="flex items-center gap-2 text-sm btn btn-ghost btn-sm"
                    style={{
                        color: `var(--${currentTheme}-text-default)`, // Use theme color
                    }}
                    onClick={handleCloseClick}
                >
                    <FaX
                        className="w-4 h-4"
                        style={{ color: `var(--${currentTheme}-accent-red)` }}
                    />{' '}
                    {/* Use theme color */}
                    Close
                </button>
            </div>
            <div className="w-full flex justify-center">
                <Picker
                    onClick={(e: any) => {
                        e.stopPropagation();
                    }}
                    onEmojiSelect={handleEmojiSelect}
                    set="native"
                    theme="dark"
                    perLine={7}
                    style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%', // Force the Picker to take full width
                        maxWidth: '100%', // Ensure it doesn't overflow
                    }}
                />
            </div>
        </div>
    );
};
