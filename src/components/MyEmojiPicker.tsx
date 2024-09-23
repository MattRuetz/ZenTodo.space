import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import EmojiPicker, { EmojiStyle, Categories } from 'emoji-picker-react';
import { useEffect } from 'react';
import { FaTrash, FaX } from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';

interface MyEmojiPickerProps {
    setTaskEmoji?: (emoji: string) => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const MyEmojiPicker = ({
    setTaskEmoji,
    setIsOpen,
}: MyEmojiPickerProps) => {
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

    return (
        <div
            className="emoji-picker-container p-2 rounded-lg shadow-md"
            style={{
                backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
            }}
        >
            <button
                className="flex items-center gap-2 text-sm btn btn-ghost btn-sm"
                style={{
                    color: `var(--${currentTheme}-text-default)`, // Use theme color
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    if (setTaskEmoji) {
                        setTaskEmoji('');
                        setIsOpen(false);
                    }
                }}
            >
                <FaX
                    className="w-4 h-4"
                    style={{ color: `var(--${currentTheme}-accent-red)` }}
                />{' '}
                {/* Use theme color */}
                No Emoji
            </button>
            <Picker
                onClick={(e: any) => {
                    e.stopPropagation();
                }}
                onEmojiSelect={(emoji: any) => {
                    if (setTaskEmoji) {
                        setTaskEmoji(emoji.native);
                    }
                    setIsOpen(false);
                }}
                set="native"
                theme="dark"
                style={{
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                }}
            />
        </div>
    );
};
