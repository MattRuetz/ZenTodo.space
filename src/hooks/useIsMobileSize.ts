import { useMediaQuery } from 'react-responsive';

export const useIsMobileSize = () => {
    return useMediaQuery({ maxWidth: 1023 }); // Adjust the breakpoint as needed
};
