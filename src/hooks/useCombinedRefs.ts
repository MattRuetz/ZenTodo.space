import { useCallback } from 'react';

export function useCombinedRefs(...refs: any[]) {
    return useCallback(
        (element: any) => {
            refs.forEach((ref) => {
                if (typeof ref === 'function') {
                    ref(element);
                } else if (ref) {
                    ref.current = element;
                }
            });
        },
        [refs]
    );
}
