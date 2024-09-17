import React, { useState } from 'react';
import EmojiPicker, { Categories, EmojiStyle } from 'emoji-picker-react';
import { FaTag, FaX } from 'react-icons/fa6';
import { MyEmojiPicker } from './MyEmojiPicker';

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
        <div className="emoji-tag cursor-pointer p-1 transition-colors duration-200 rounded-lg">
            <div
                className="emoji-tag-icon hover:scale-110 hover:rotate-12 transition-transform duration-200"
                onClick={toggleDropdown}
            >
                {taskEmoji}
            </div>
            <div className="emoji-dropdown-menu absolute top-10 left-0 z-20">
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
