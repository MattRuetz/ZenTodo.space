import React, { useState } from 'react';
import { MyEmojiPicker } from './MyEmojiPicker';

interface EmojiDropdownProps {
    taskEmoji: string | React.JSX.Element;
    setTaskEmoji: (emoji: string) => void;
    inSubtaskDrawer?: boolean;
}

const EmojiDropdown: React.FC<EmojiDropdownProps> = ({
    taskEmoji,
    setTaskEmoji,
    inSubtaskDrawer,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    return (
        <div className="emoji-tag cursor-pointer p-1 transition-colors duration-200 rounded-lg">
            <div
                className="emoji-tag-icon w-4 h-4 flex items-center justify-center hover:scale-110 hover:rotate-12 transition-transform duration-200"
                onClick={toggleDropdown}
            >
                {taskEmoji}
            </div>
            <div
                className={`emoji-dropdown-menu left-1/2 -translate-x-1/2 z-20 ${
                    inSubtaskDrawer ? 'fixed top-28' : 'absolute'
                }`}
            >
                {isOpen && (
                    <>
                        <MyEmojiPicker
                            setTaskEmoji={setTaskEmoji}
                            setIsOpen={setIsOpen}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default EmojiDropdown;
