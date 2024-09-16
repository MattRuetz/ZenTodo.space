import EmojiPicker, { EmojiStyle, Categories } from 'emoji-picker-react';
import { useEffect } from 'react';

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
            const emojiPicker = document.querySelector('.EmojiPickerReact');
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
        <EmojiPicker
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
                backgroundColor: '#1F2937',
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
        />
    );
};
