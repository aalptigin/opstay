// Time formatting utilities

/**
 * Format a timestamp as "X time ago" or absolute date
 */
export function formatTimeAgo(isoTimestamp: string): string {
    const now = new Date();
    const past = new Date(isoTimestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
        return "Az önce";
    } else if (diffMinutes < 60) {
        return `${diffMinutes} dk önce`;
    } else if (diffHours < 24) {
        return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
        return `${diffDays} gün önce`;
    } else {
        // Format as DD.MM.YYYY HH:mm
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(past);
    }
}

/**
 * Format a date with Turkish locale
 */
export function formatDate(isoTimestamp: string): string {
    const date = new Date(isoTimestamp);
    return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(date);
}
