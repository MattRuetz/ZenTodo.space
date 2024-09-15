export const useDateTimeString = (date: Date) => {
    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString();

    const today = new Date().toLocaleDateString();
    if (dateString === today) {
        return `Today at ${timeString}`;
    } else {
        const diff = new Date().getTime() - date.getTime();
        const diffDays = Math.floor(diff / (1000 * 3600 * 24));
        if (diffDays === 1) {
            return `Yesterday at ${timeString}`;
        }
    }
    const dateTimeString = `${dateString} at ${timeString}`;
    return dateTimeString;
};

export const useDateString = (date: Date) => {
    const dateString = date.toLocaleDateString();
    const today = new Date().toLocaleDateString();
    if (dateString === today) {
        return 'Today';
    } else {
        const diff = new Date().getTime() - date.getTime();
        const diffDays = Math.floor(diff / (1000 * 3600 * 24));
        if (diffDays === 1) {
            return 'Yesterday';
        }
    }
    return dateString;
};

export const useTimeString = (date: Date) => {
    const timeString = date.toLocaleTimeString();
    return timeString;
};
