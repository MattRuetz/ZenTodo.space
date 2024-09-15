import { Tag } from '@/types';
import EmojiPicker from 'emoji-picker-react';
import { useEffect, useRef, useState } from 'react';

const TagLabel = ({
    tag,
    handleClick,
}: {
    tag: Tag;
    handleClick: (tag: Tag) => void;
}) => {
    return (
        <div
            className="flex items-center gap-1 rounded-full py-1 px-2 text-sm text-slate-800 relative"
            style={{ backgroundColor: tag.color }}
            onClick={() => handleClick(tag)}
        >
            <span>{tag.emoji}</span>
            <span>{tag.name}</span>
        </div>
    );
};

export default TagLabel;
