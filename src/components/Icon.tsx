// src/components/Icon.tsx
import React from 'react';

interface IconProps {
    name: string;
    style?: React.CSSProperties;
    className?: string;
    size?: number;
    color?: string;
}

export const Icon: React.FC<IconProps> = React.memo(
    ({ name, className = '', style, size = 24, color = 'currentColor' }) => {
        return (
            <svg
                className={`icon ${className}`}
                width={size}
                height={size}
                aria-hidden="true"
                style={{ fill: color, color: color, ...style }}
            >
                <use href={`/icons/sprite.svg#${name}`} />
            </svg>
        );
    }
);
