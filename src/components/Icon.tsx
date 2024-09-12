// src/components/Icon.tsx
import React from 'react';

interface IconProps {
    name: string;
    className?: string;
    size?: number;
}

export const Icon: React.FC<IconProps> = ({
    name,
    className = '',
    size = 24,
}) => {
    return (
        <svg
            className={`icon ${className}`}
            width={size}
            height={size}
            aria-hidden="true"
        >
            <use href={`/icons/sprite.svg#${name}`} />
        </svg>
    );
};
