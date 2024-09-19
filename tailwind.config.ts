import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },

            buji: {
                background300: '#1a1a1a', // Dark background
                background200: '#3a3a3a', // Dark background
                background100: '#5a5a5a', // Dark background
                text: '#ffffff', // Light text
            },
            daigo: {
                background: '#f1f1f1', // Light background
                text: '#000000', // Dark text
            },
            enzu: {
                background: '#d9e6d9', // Soft green
                text: '#f5f5dc', // Beige
            },
        },
    },
    plugins: [],
};
export default config;
