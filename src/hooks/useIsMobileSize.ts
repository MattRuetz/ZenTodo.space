import { useMediaQuery } from 'react-responsive';

export const useIsMobileSize = () => {
    return useMediaQuery({ maxWidth: 767 }); // Adjust the breakpoint as needed
};
