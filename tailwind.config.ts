import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/**/*.{js,cjs,ts,tsx,jsx,mdx}',
        './src/pages/**/*.{js,cjs,ts,tsx,jsx,mdx}',
        './src/components/**/*.{js,cjs,ts,tsx,jsx,mdx}',
        './src/app/**/*.{js,cjs,ts,tsx,jsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            animation: {
                fadeOut: 'fadeOut 0.5s ease-in-out forwards',
            },
            keyframes: {
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
    daisyui: {
        themes: ['light', 'dark', 'cupcake'],
    },
};
export default config;
