import React from 'react';

const zenQuotes = [
    'The obstacle is the path. - Zen Proverb',
    'When you reach the top of the mountain, keep climbing. - Zen Proverb',
    'Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water. - Zen Proverb',
    'The journey of a thousand miles begins with a single step. - Lao Tzu',
    "In the beginner's mind there are many possibilities, but in the expert's there are few. - Shunryu Suzuki",
    'To study the self is to forget the self. - Dogen',
    'Silence is the language of God, all else is poor translation. - Rumi',
    'The only Zen you find on the tops of mountains is the Zen you bring up there. - Robert M. Pirsig',
    'When thoughts arise, then do all things arise. When thoughts vanish, then do all things vanish. - Huang Po',
    'Zen is not some kind of excitement, but concentration on our usual everyday routine. - Shunryu Suzuki',
    'The practice of Zen is forgetting the self in the act of uniting with something. - Koun Yamada',
    'If you miss the present moment, you miss your appointment with life. - Thich Nhat Hanh',
    'Wherever you are, be there totally. - Eckhart Tolle',
    'The less you try to impress, the more impressive you are. - Zen Saying',
    'When you realize nothing is lacking, the whole world belongs to you. - Lao Tzu',
    "Do not seek the truth, only cease to cherish your opinions. - Seng-ts'an",
    'Zen is not some kind of excitement, but concentration on our usual everyday routine. - Shunryu Suzuki',
    'The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to be kind. - Buddha',
    'The way to get started is to quit talking and begin doing. - Walt Disney',
    'The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt',
    'The best way to predict the future is to invent it. - Alan Kay',
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    'The secret of getting ahead is getting started. - Mark Twain',
    'The only way to do great work is to love what you do. - Steve Jobs',
];

const getQuoteForDay = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
        (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    return zenQuotes[dayOfYear % zenQuotes.length];
};

interface PreloaderProps {
    fadeOut: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ fadeOut }) => {
    const quote = getQuoteForDay();

    return (
        <div
            className={`preloader fixed inset-0 z-50 flex flex-col items-center justify-center bg-base-100 transition-opacity duration-500 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <span className="loading loading-infinity text-slate-600 loading-lg"></span>
            <p className="mt-4 text-slate-600">Loading space...</p>
            <p className="mt-2 text-md text-neutral-content italic max-w-md text-center">
                "{quote}"
            </p>
        </div>
    );
};

export default Preloader;
