import SortingDropdown from '../Subtask/SortingDropdown';
import Breadcrumb from './Breadcrumb';
import { Task } from '@/types';

const FixedTopBar = ({
    currentParent,
    handleBack,
}: {
    currentParent: Task | null;
    handleBack: () => void;
}) => {
    return (
        <div className="header flex items-center justify-between p-4">
            <Breadcrumb task={currentParent} onBack={handleBack} />
            <SortingDropdown />
        </div>
    );
};

export default FixedTopBar;
