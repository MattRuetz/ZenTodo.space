import { Tooltip } from 'react-tooltip';
import { FaBoxArchive } from 'react-icons/fa6';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobileSize } from '@/hooks/useIsMobileSize';

interface ArchiveTaskBtnProps {
    taskId: string;
    handleArchiveClick: () => void;
}

export const ArchiveTaskBtn: React.FC<ArchiveTaskBtnProps> = ({
    taskId,
    handleArchiveClick,
}) => {
    const currentTheme = useTheme();
    const isMobileSize = useIsMobileSize();

    return (
        <div className="inline-block">
            <button
                data-tooltip-id={`${taskId}-archive-tooltip`}
                className="p-2 rounded-md text-sm flex items-center gap-2"
                style={{
                    backgroundColor: `var(--${currentTheme}-background-200)`, // Use theme color
                    color: `var(--${currentTheme}-text-default)`, // Use theme color
                }}
                onMouseEnter={(e) => {
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = `var(--${currentTheme}-accent-green)`;
                    e.currentTarget.style.color = 'black';
                }}
                onMouseLeave={(e) => {
                    e.stopPropagation();
                    e.currentTarget.style.backgroundColor = `var(--${currentTheme}-background-200)`;
                    e.currentTarget.style.color = `var(--${currentTheme}-text-default)`;
                }}
                onClick={handleArchiveClick}
            >
                <FaBoxArchive />
            </button>
            {!isMobileSize && (
                <Tooltip id={`${taskId}-archive-tooltip`} place="top">
                    <div className="progressLabel">
                        <span>Send to Archive</span>
                    </div>
                </Tooltip>
            )}
        </div>
    );
};
