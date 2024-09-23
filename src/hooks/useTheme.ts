import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export const useTheme = () => {
    const currentTheme = useSelector(
        (state: RootState) => state.theme.currentTheme
    );
    return currentTheme;
};
