import { useMediaQuery } from 'react-responsive';

export const useIsMobile = () => {
    return useMediaQuery({ maxWidth: 767 }); // Adjust the breakpoint as needed
};
