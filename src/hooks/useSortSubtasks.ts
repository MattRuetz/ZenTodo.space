import { useCallback, useMemo, useState } from 'react';
import { Task } from '@/types';
import { updateSubtaskOrder } from '@/store/tasksSlice';
import { useDispatch } from 'react-redux';

export const useSortSubtasks = ({
    subtasks,
    parentTask,
}: {
    subtasks: Task[];
    parentTask: Task;
}) => {
    const dispatch = useDispatch();
    const [sortOption, setSortOption] = useState<
        'custom' | 'name' | 'progress' | 'created' | 'lastEdited'
    >('custom');
    const [isReversed, setIsReversed] = useState(false);

    const handleSortChange = useCallback(
        (
            option: 'custom' | 'name' | 'progress' | 'created' | 'lastEdited',
            reversed: boolean
        ) => {
            setSortOption(option);
            setIsReversed(reversed);
        },
        []
    );

    const sortedSubtasks = useMemo(() => {
        if (sortOption === 'custom') return subtasks;

        return [...subtasks].sort((a, b) => {
            let comparison = 0;
            switch (sortOption) {
                case 'name':
                    comparison = a.taskName.localeCompare(b.taskName);
                    break;
                case 'progress':
                    comparison = a.progress.localeCompare(b.progress);
                    break;
                case 'created':
                    comparison =
                        new Date(a.createdAt as Date).getTime() -
                        new Date(b.createdAt as Date).getTime();
                    break;
                case 'lastEdited':
                    comparison =
                        new Date(a.updatedAt as Date).getTime() -
                        new Date(b.updatedAt as Date).getTime();
                    break;
            }
            return isReversed ? -comparison : comparison;
        });
    }, [subtasks, sortOption, isReversed]);

    const handleReorder = useCallback(
        (reorderedSubtasks: Task[]) => {
            if (sortOption !== 'custom') {
                setSortOption('custom');
            }
            if (parentTask && parentTask._id) {
                dispatch(
                    updateSubtaskOrder({
                        parentId: parentTask._id,
                        subtaskIds: reorderedSubtasks.map((task) => task._id),
                    })
                );
            }
        },
        [dispatch, parentTask, sortOption]
    );

    return {
        sortedSubtasks,
        handleSortChange,
        handleReorder,
    };
};
