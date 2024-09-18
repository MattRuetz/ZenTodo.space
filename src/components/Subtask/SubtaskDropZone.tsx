import { AppDispatch, RootState } from '@/store/store';
import { Task, TaskProgress } from '@/types';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useDrop, useDragLayer } from 'react-dnd';
import { useMoveSubtask } from '@/hooks/useMoveSubtask';
import { useAddNewSubtask } from '@/hooks/useAddNewSubtask';

interface SubtaskDropZoneProps {
    position: string;
    parentTask: Task | null;
}

const SubtaskDropZone = React.memo(
    ({ position, parentTask }: SubtaskDropZoneProps) => {
        const { addNewSubtask } = useAddNewSubtask();
        const { moveSubtaskTemporary, commitSubtaskOrder } = useMoveSubtask();
        const sortOption = useSelector(
            (state: RootState) => state.ui.sortOption
        );

        const [hoverStatus, setHoverStatus] = useState('hiding');
        const [textOpacity, setTextOpacity] = useState(0);

        const dropRef = useRef<HTMLLIElement>(null);

        const handleHover = useCallback(
            (item: Task, monitor: any) => {
                if (parentTask && parentTask._id && sortOption === 'custom') {
                    moveSubtaskTemporary(
                        item._id as string,
                        parentTask._id,
                        position
                    );
                }
            },
            [parentTask, position, sortOption, moveSubtaskTemporary]
        );

        const [{ isOver }, drop] = useDrop(
            () => ({
                accept: 'SUBTASK',
                hover: handleHover,
                // drop: handleDrop,
                collect: (monitor) => ({
                    isOver: !!monitor.isOver(),
                }),
            }),
            [handleHover]
        );

        drop(dropRef);

        const handleMouseEnter = () => {
            setHoverStatus('prompting-to-add');
            setTextOpacity(1);
        };

        const handleMouseLeave = () => {
            setHoverStatus('hiding');
            setTextOpacity(0);
        };

        const handleAddSubtask = () => {
            const newSubtask: Omit<Task, '_id'> = {
                taskName: 'New Subtask',
                taskDescription: '',
                x: parentTask?.x || 0,
                y: parentTask?.y || 0,
                progress: 'Not Started' as TaskProgress,
                space: parentTask?.space || '',
                zIndex: parentTask?.zIndex || 0,
                subtasks: [],
                parentTask: parentTask?._id as string,
                ancestors: parentTask?.ancestors
                    ? [...parentTask.ancestors, parentTask._id as string]
                    : [parentTask?._id as string],
                width: 100,
                height: 100,
                emoji: '',
            };

            addNewSubtask({
                subtask: newSubtask,
                parentId: parentTask?._id as string,
                position: position,
            });
        };

        return (
            <div
                ref={dropRef as unknown as React.RefObject<HTMLDivElement>}
                className="w-full"
            >
                {position === 'start' ? (
                    <div
                        className="flex mb-2 bg-slate-800 hover:bg-sky-950 transition-all duration-300 ease-in-out cursor-pointer rounded-lg px-2 py-1 justify-center text-sm font-semibold"
                        onClick={handleAddSubtask}
                    >
                        + new subtask
                    </div>
                ) : (
                    <>
                        <div
                            className="p-2"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onClick={handleAddSubtask}
                        >
                            <div
                                className={`w-full rounded-lg transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
                                    hoverStatus === 'hiding'
                                        ? 'h-1 bg-base-300'
                                        : 'h-7 bg-sky-950'
                                }`}
                            >
                                <div
                                    className="h-full flex items-center justify-center bg-sky-950 rounded-full px-2 py-1 text-sm font-semibold"
                                    style={{
                                        opacity: textOpacity,
                                        transition: 'opacity 0.3s ease-in-out',
                                    }}
                                >
                                    + new subtask
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        );
    }
);

export default SubtaskDropZone;
