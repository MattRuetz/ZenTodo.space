import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import EmojiPicker, { EmojiStyle, Categories } from 'emoji-picker-react';
import { useEffect } from 'react';
import { FaTrash, FaX } from 'react-icons/fa6';

interface MyEmojiPickerProps {
    setTaskEmoji?: (emoji: string) => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const MyEmojiPicker = ({
    setTaskEmoji,
    setIsOpen,
}: MyEmojiPickerProps) => {
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
        <div className="emoji-picker-container bg-sky-950 p-2 rounded-lg shadow-md">
            <button
                className="flex items-center gap-2 text-sm text-white btn btn-ghost btn-sm"
                onClick={(e) => {
                    e.stopPropagation();
                    if (setTaskEmoji) {
                        setTaskEmoji('');
                        setIsOpen(false);
                    }
                }}
            >
                <FaX className="w-4 h-4 text-red-500" /> No Emoji
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
