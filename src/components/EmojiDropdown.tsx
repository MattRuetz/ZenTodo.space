import React, { useState } from 'react';
import EmojiPicker, { Categories, EmojiStyle } from 'emoji-picker-react';
import { FaTag } from 'react-icons/fa6';

interface EmojiDropdownProps {
    taskEmoji: string | React.JSX.Element;
    setTaskEmoji: (emoji: string) => void;
}

const EmojiDropdown: React.FC<EmojiDropdownProps> = ({
    taskEmoji,
    setTaskEmoji,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="emoji-tag cursor-pointer p-1 bg-base-100 hover:bg-slate-800 transition-colors duration-200 rounded-lg">
            <div className="emoji-tag-icon text-xl" onClick={toggleDropdown}>
                {taskEmoji}
            </div>
            <div className="emoji-dropdown-menu absolute top-8 left-0 z-20">
                {isOpen && (
                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            setTaskEmoji(emojiData.emoji);
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
                )}
            </div>
        </div>
    );
};

export default EmojiDropdown;
