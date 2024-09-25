const zenQuotes = [
    `"The obstacle is the path." - Zen Proverb`,
    `"When you reach the top of the mountain, keep climbing." - Zen Proverb`,
    `"Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water." - Zen Proverb`,
    `"The journey of a thousand miles begins with a single step." - Lao Tzu`,
    `"In the beginner's mind there are many possibilities, but in the expert's there are few." - Shunryu Suzuki`,
    `"To study the self is to forget the self." - Dogen`,
    `"Silence is the language of God, all else is poor translation." - Rumi`,
    `"The only Zen you find on the tops of mountains is the Zen you bring up there." - Robert M. Pirsig`,
    `"When thoughts arise, then do all things arise. When thoughts vanish, then do all things vanish." - Huang Po`,
    `"Zen is not some kind of excitement, but concentration on our usual everyday routine." - Shunryu Suzuki`,
    `"The practice of Zen is forgetting the self in the act of uniting with something." - Koun Yamada`,
    `"If you miss the present moment, you miss your appointment with life." - Thich Nhat Hanh`,
    `"Wherever you are, be there totally." - Eckhart Tolle`,
    `"The less you try to impress, the more impressive you are." - Zen Saying`,
    `"When you realize nothing is lacking, the whole world belongs to you." - Lao Tzu`,
    `"Do not seek the truth, only cease to cherish your opinions." - Seng-ts'an`,
    `"Zen is not some kind of excitement, but concentration on our usual everyday routine." - Shunryu Suzuki`,
    `"The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to be kind." - Buddha`,
    `"The way to get started is to quit talking and begin doing." - Walt Disney`,
    `"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt`,
    `"The best way to predict the future is to invent it." - Alan Kay`,
    `"Believe you can and you're halfway there." - Theodore Roosevelt`,
    `"The secret of getting ahead is getting started." - Mark Twain`,
    `"The only way to do great work is to love what you do." - Steve Jobs`,
    `"The only journey is the one within." - Rainer Maria Rilke`,
    `"To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment." - Ralph Waldo Emerson`,
    `"The mind is everything. What you think you become." - Buddha`,
    `"Happiness is not something ready-made. It comes from your own actions." - Dalai Lama`,
    `"The only limit to our realization of tomorrow will be our doubts of today." - Franklin D. Roosevelt`,
    `"You must be the change you wish to see in the world." - Mahatma Gandhi`,
    `"Life is really simple, but we insist on making it complicated." - Confucius`,
    `"The greatest glory in living lies not in never falling, but in rising every time we fall." - Nelson Mandela`,
    `"What lies behind us and what lies before us are tiny matters compared to what lies within us." - Ralph Waldo Emerson`,
    `"The best way to find yourself is to lose yourself in the service of others." - Mahatma Gandhi`,
    `"In the middle of difficulty lies opportunity." - Albert Einstein`,
    `"Act as if what you do makes a difference. It does." - William James`,
    `"The only way to do great work is to love what you do." - Steve Jobs`,
    `"Success is not the key to happiness. Happiness is the key to success." - Albert Schweitzer`,
    `"The purpose of our lives is to be happy." - Dalai Lama`,
    `"You only live once, but if you do it right, once is enough." - Mae West`,
    `"Life is what happens when you're busy making other plans." - John Lennon`,
    `"The best revenge is massive success." - Frank Sinatra`,
    `"Your time is limited, so don't waste it living someone else's life." - Steve Jobs`,
    `"The future belongs to those who believe in the beauty of their dreams." - Eleanor Roosevelt`,
];

export const getQuoteForDay = () => {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
        (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    return zenQuotes[dayOfYear % zenQuotes.length];
};
