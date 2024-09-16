import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { SpaceData } from '@/types';
import { deleteSpace, updateSpace } from '@/store/spaceSlice';
import { AppDispatch } from '@/store/store';
import EmojiDropdown from '../EmojiDropdown';
import { FaTag } from 'react-icons/fa';
import { getComplementaryColor, getContrastingColor } from '@/app/utils/utils';
import { FaTrash } from 'react-icons/fa6';

interface SpaceCardProps {
    space: SpaceData;
    onClick: () => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({ space, onClick }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(space.name);
    const [color, setColor] = useState(space.color);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setColor(e.target.value);
    };

    const handleSubmit = () => {
        dispatch(updateSpace({ ...space, name, color }));
        setIsEditing(false);
    };

    const handleSetSpaceEmoji = (emoji: string) => {
        dispatch(updateSpace({ ...space, emoji }));
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (!isEditing) {
            onClick();
        }
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        if (space._id) {
            dispatch(deleteSpace(space._id));
        }
        setShowDeleteConfirm(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const contrastColor = getContrastingColor(color);
    const complementaryColor = getComplementaryColor(color);

    return (
        <div
            className="space rounded-lg shadow-md hover:shadow-xl p-8 cursor-pointer relative flex flex-row justify-start items-center gap-4 min-h-[150px] max-h-[300px] hover:-rotate-1 border-4 border-transparent hover:border-white transition-all duration-300 ease-in-out"
            style={{ backgroundColor: color }}
            onClick={handleCardClick}
        >
            <div
                className=" shadow-slate-900 rounded-full p-1 text-2xl"
                style={{
                    backgroundColor: contrastColor,
                    border: `1px solid ${contrastColor}`,
                    color: complementaryColor,
                }}
            >
                <EmojiDropdown
                    taskEmoji={space.emoji || <FaTag />}
                    setTaskEmoji={handleSetSpaceEmoji}
                />
            </div>
            {isEditing ? (
                <>
                    <div
                        className="absolute rounded-full bottom-4 right-4 p-4 text-xl text-red-600 hover:text-red-700 cursor-pointer hover:rotate-12 transition-transform duration-300 ease-in-out"
                        onClick={handleDelete}
                        style={{
                            backgroundColor: contrastColor,
                        }}
                    >
                        <FaTrash />
                    </div>
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-2"
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={handleNameChange}
                            className="input input-bordered w-full"
                            maxLength={20}
                        />
                        <div className="flex items-center gap-2 bg-white rounded-lg p-0.5 px-2">
                            <label
                                htmlFor="colorPicker"
                                className="flex-grow p-2 rounded cursor-pointer text-sm font-medium"
                                style={{
                                    backgroundColor: color,
                                    color: getContrastingColor(color),
                                }}
                            >
                                Choose Space Color
                            </label>
                            <input
                                id="colorPicker"
                                type="color"
                                value={color}
                                onChange={handleColorChange}
                                className="w-10 h-10 cursor-pointer"
                                style={{
                                    backgroundColor: color,
                                    visibility: 'hidden',
                                    width: '0',
                                }}
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-sm"
                            style={{
                                backgroundColor: color,
                                color: contrastColor,
                                border: `1px solid ${contrastColor}`,
                            }}
                        >
                            Save
                        </button>
                    </form>
                </>
            ) : (
                <>
                    <h2
                        className="text-2xl font-bold mb-2 line-clamp-2 break-words"
                        style={{
                            color: contrastColor,
                        }}
                    >
                        {name}
                    </h2>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="btn btn-sm btn-ghost absolute top-2 right-2"
                        style={{
                            color: contrastColor,
                        }}
                    >
                        Edit
                    </button>
                </>
            )}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-xl max-w-sm shadow-slate-900/50">
                        <h3 className="text-xl font-bold mb-4">
                            Delete Space?
                        </h3>
                        <p className="mb-6">
                            Are you sure you want to delete this space? This
                            action will delete the space and all of its tasks.
                            This cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="btn btn-ghost"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpaceCard;
