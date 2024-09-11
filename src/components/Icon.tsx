// src/components/Icon.tsx
import React from 'react';

interface IconProps {
    name: string;
    className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '' }) => {
    return (
        <svg className={`icon ${className}`} aria-hidden="true">
            <use href={`/icons/sprite.svg#${name}`} />
        </svg>
    );
};
