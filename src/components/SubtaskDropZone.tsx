import { AppDispatch, RootState } from '@/store/store';
import { addNewSubtask, moveSubtaskWithinLevel } from '@/store/tasksSlice';
import { SortOption, Task, TaskProgress } from '@/types';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop } from 'react-dnd';

interface SubtaskDropZoneProps {
    position: string;
    parentTask: Task | null;
}

const SubtaskDropZone: React.FC<SubtaskDropZoneProps> = ({
    position,
    parentTask,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const sortOption = useSelector((state: RootState) => state.ui.sortOption);
    const [hoverStatus, setHoverStatus] = useState('hiding');
    const [textOpacity, setTextOpacity] = useState(0);
    const hoverRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleDrop = useCallback(
        (item: Task) => {
            console.log('global option', sortOption);
            if (parentTask && parentTask._id && sortOption === 'custom') {
                dispatch(
                    moveSubtaskWithinLevel({
                        subtaskId: item._id as string,
                        parentId: parentTask._id,
                        newPosition: position,
                    })
                );
            } else {
                alert('Custom sorting is not enabled.');
            }
        },
        [dispatch, parentTask, position, sortOption]
    );

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: 'SUBTASK',
            drop: handleDrop,
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
            }),
        }),
        [handleDrop]
    );

    const handleMouseEnter = () => {
        hoverRef.current = true;
        setHoverStatus('peaking');
        timeoutRef.current = setTimeout(() => {
            if (hoverRef.current) {
                setHoverStatus('prompting-to-add');
                setTextOpacity(1);
            }
        }, 400);
    };

    const handleMouseLeave = () => {
        hoverRef.current = false;
        setHoverStatus('hiding');
        setTextOpacity(0);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
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
        };

        dispatch(
            addNewSubtask({
                subtask: newSubtask,
                position: position,
            })
        );
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return (
        <div ref={drop} className="w-full">
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
                                    : hoverStatus === 'peaking'
                                    ? 'h-2 bg-slate-800'
                                    : 'h-7 bg-sky-950'
                            } ${isOver ? 'py-4 bg-sky-950' : ''}`}
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
};

export default SubtaskDropZone;
