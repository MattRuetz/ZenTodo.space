import React, { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
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

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="emoji-tag cursor-pointer" onClick={toggleDropdown}>
            <div className="emoji-tag-icon">{taskEmoji}</div>
            <div className="emoji-dropdown-menu absolute top-8 left-0">
                {isOpen && (
                    <EmojiPicker
                        onEmojiClick={(emojiData) => {
                            setTaskEmoji(emojiData.emoji);
                            setIsOpen(false);
                        }}
                        open={true}
                        lazyLoadEmojis={true}
                        skinTonesDisabled={true}
                    />
                )}
            </div>
        </div>
    );
};

export default EmojiDropdown;
