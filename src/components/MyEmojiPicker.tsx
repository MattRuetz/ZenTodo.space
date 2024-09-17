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
                onClick={() => {
                    if (setTaskEmoji) {
                        setTaskEmoji('');
                        setIsOpen(false);
                    }
                }}
            >
                <FaX className="w-4 h-4 text-red-500" /> No Emoji
            </button>
            {/* <EmojiPicker
                onEmojiClick={(emojiData) => {
                    if (setTaskEmoji) {
                        setTaskEmoji(emojiData.emoji);
                    }
                    setIsOpen(false);
                }}
                open={true}
                lazyLoadEmojis={true}
                skinTonesDisabled={true}
                width={280}
                height={400}
                emojiStyle={EmojiStyle.NATIVE}
                style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                }}
                categories={[
                    {
                        category: 'smileys_people' as Categories,
                        name: 'Smileys & People',
                    },
                    {
                        category: 'animals_nature' as Categories,
                        name: 'Animals & Nature',
                    },
                    {
                        category: 'food_drink' as Categories,
                        name: 'Food & Drink',
                    },
                    {
                        category: 'travel_places' as Categories,
                        name: 'Travel & Places',
                    },
                    {
                        category: 'activities' as Categories,
                        name: 'Activities',
                    },
                    {
                        category: 'objects' as Categories,
                        name: 'Objects',
                    },
                    {
                        category: 'symbols' as Categories,
                        name: 'Symbols',
                    },
                ]}
            /> */}
            <Picker
                onEmojiSelect={(emoji: any) => {
                    if (setTaskEmoji) {
                        setTaskEmoji(emoji.native);
                    }
                    setIsOpen(false);
                }}
                set="apple"
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
