import { AppDispatch } from '@/store/store';
import { addNewSubtask, moveSubtask } from '@/store/tasksSlice';
import { Task, TaskProgress } from '@/types';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useDrop } from 'react-dnd';

interface SubtaskDropZoneProps {
    index: number;
    parentTask: Task | null;
}

const SubtaskDropZone: React.FC<SubtaskDropZoneProps> = ({
    index,
    parentTask,
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const [hoverStatus, setHoverStatus] = useState('hiding');
    const [textOpacity, setTextOpacity] = useState(0);
    const hoverRef = useRef<boolean>(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [{ isOver }, drop] = useDrop(
        () => ({
            accept: 'SUBTASK',
            drop: (item: Task) => {
                if (parentTask && parentTask._id) {
                    dispatch(
                        moveSubtask({
                            subtaskId: item._id as string,
                            newParentId: parentTask._id,
                            newIndex: index,
                        })
                    );
                }
            },
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
            }),
        }),
        [parentTask, index]
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
                ? [...parentTask.ancestors, parentTask?._id as string]
                : [parentTask?._id as string],
        };

        dispatch(
            addNewSubtask({
                subtask: newSubtask,
                index: index,
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
        <div
            className={`py-2 transition-all duration-300 ease-in-out ${
                isOver ? 'bg-sky-950' : 'bg-transparent'
            }`}
            ref={drop as unknown as React.RefObject<HTMLDivElement>}
        >
            {index === 0 ? (
                <div
                    data-index={index}
                    className="flex bg-transparent hover:bg-sky-900 transition-all duration-300 ease-in-out cursor-pointer rounded-lg px-2 py-1 justify-center text-sm font-semibold"
                    onClick={handleAddSubtask}
                >
                    + new subtask
                </div>
            ) : (
                <>
                    <div
                        data-index={index}
                        className={`w-full rounded-lg transition-all duration-300 ease-in-out cursor-pointer overflow-hidden ${
                            hoverStatus === 'hiding'
                                ? 'h-2 bg-transparent'
                                : hoverStatus === 'peaking'
                                ? 'h-5 bg-slate-800'
                                : 'h-10 bg-sky-950'
                        }`}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleAddSubtask}
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
                </>
            )}
        </div>
    );
};

export default SubtaskDropZone;
