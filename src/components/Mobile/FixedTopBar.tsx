import { AppDispatch, RootState } from '@/store/store';
import { EmojiFilter } from '../Space/EmojiFilter';
import SortingDropdown from '../Subtask/SortingDropdown';
import Breadcrumb from './Breadcrumb';
import { Task } from '@/types';
import { useSelector } from 'react-redux';
import { setControlPanelOpen } from '@/store/uiSlice';
import { useDispatch } from 'react-redux';
import ControlPanelToggle from '../SuperSpace/ControlPanelToggle';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useTheme } from '@/hooks/useTheme';
const FixedTopBar = ({
    currentParent,
    handleBack,
}: {
    currentParent: Task | null;
    handleBack: () => void;
}) => {
    const dispatch = useDispatch<AppDispatch>();
    const isMobile = useIsMobile();
    const currentTheme = useTheme();
    const currentSpace = useSelector(
        (state: RootState) => state.spaces.currentSpace
    );
    const isControlPanelOpen = useSelector(
        (state: RootState) => state.ui.isControlPanelOpen
    );
    const setIsOpen = (isOpen: boolean) => {
        dispatch(setControlPanelOpen(isOpen));
    };

    return (
        <div className="header flex flex-col items-start justify-between w-full">
            <div
                className="header flex items-center justify-between p-2 w-full sticky top-0"
                style={{
                    backgroundColor: `var(--${currentTheme}-background-100)`,
                    zIndex: 10000,
                }}
            >
                <ControlPanelToggle
                    isOpen={isControlPanelOpen}
                    setIsOpen={setIsOpen}
                    isMobile={isMobile}
                />
                <div className="flex items-center justify-center gap-4">
                    {!currentParent && (
                        <EmojiFilter
                            clearSelectedEmojis={() => {}}
                            spaceId={currentSpace?._id ?? ''}
                        />
                    )}
                    <SortingDropdown />
                </div>
            </div>
            <div
                className="w-full p-4 border-b"
                style={{
                    borderColor: `var(--${currentTheme}-background-300)`,
                }}
            >
                <Breadcrumb task={currentParent} onBack={handleBack} />
            </div>
        </div>
    );
};

export default FixedTopBar;
