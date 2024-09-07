/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{js,ts,tsx,jsx}'],
    theme: {
        extend: {
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
