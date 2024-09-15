import { Tag } from '@/types';
import TagLabel from '../Space/TagLabel';
import { FaTag } from 'react-icons/fa6';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

const TagSelector = ({
    activeTags,
    updateTags,
}: {
    activeTags: Tag[];
    updateTags: (tags: Tag[]) => void;
}) => {
    const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);

    const tags = useSelector((state: RootState) => state.tasks.tags);

    const toggleTag = (tag: Tag) => {
        if (activeTags.includes(tag)) {
            updateTags(activeTags.filter((t) => t._id !== tag._id));
        } else {
            updateTags([...activeTags, tag]);
        }
    };

    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {};

        window.addEventListener('mousedown', handleMouseDown);

        return () => {
            window.removeEventListener('mousedown', handleMouseDown);
        };
    }, [isTagSelectorOpen]);

    return (
        <div className="flex flex-row gap-2">
            <FaTag
                className="text-sky-500"
                onClick={() => setIsTagSelectorOpen(!isTagSelectorOpen)}
            />
            {isTagSelectorOpen && (
                <div className="inline-flex gap-2 flex-wrap absolute bg-slate-200 p-2 rounded-md w-[200px] h-[200px] overflow-y-auto">
                    {tags.map((tag) => (
                        <TagLabel
                            key={tag._id}
                            tag={tag}
                            toggleTag={toggleTag}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TagSelector;
