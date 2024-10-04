import React, { useState } from 'react';
import { MyEmojiPicker } from './MyEmojiPicker';
import { useTheme } from '@/hooks/useTheme';

interface EmojiDropdownProps {
    taskEmoji: string | React.JSX.Element;
    setTaskEmoji: (emoji: string) => void;
    inSubtaskDrawer?: boolean;
    isModal?: boolean;
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

const EmojiDropdown: React.FC<EmojiDropdownProps> = ({
    taskEmoji,
    setTaskEmoji,
    isModal = false,
    isOpen: externalIsOpen,
    setIsOpen: externalSetIsOpen,
}) => {
    const currentTheme = useTheme();
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    const isOpen =
        externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalSetIsOpen || setInternalIsOpen;

    const toggleDropdown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    if (isModal) {
        return (
            <>
                {isOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="bg-white rounded-lg p-4"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: `var(--${currentTheme}-background-100)`,
                            }}
                        >
                            <MyEmojiPicker
                                setTaskEmoji={(emoji) => {
                                    setTaskEmoji(emoji);
                                    setIsOpen(false);
                                }}
                                setIsOpen={setIsOpen}
                            />
                        </div>
                    </div>
                )}
            </>
        );
    }

    return (
        <div className="emoji-tag cursor-pointer p-1 transition-colors duration-200 rounded-lg">
            <div
                className="emoji-tag-icon w-4 h-4 flex items-center justify-center hover:scale-110 hover:rotate-12 transition-transform duration-200"
                onClick={toggleDropdown}
            >
                {taskEmoji}
            </div>
            <div className={`emoji-dropdown-menu z-20 absolute`}>
                {isOpen && (
                    <MyEmojiPicker
                        setTaskEmoji={setTaskEmoji}
                        setIsOpen={setIsOpen}
                    />
                )}
            </div>
        </div>
    );
};

export default EmojiDropdown;
