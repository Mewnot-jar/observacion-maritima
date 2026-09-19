export function timeAgo(dateString: string): string {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs/60000);
    if (minutes < 1) return "recien";
    if (minutes < 60) return `hace ${minutes} min`;
    
    const hours = Math.floor(minutes/60);
    if (hours < 24) return `hace ${hours} h`;

    const days = Math.floor(hours/24);
    if (days === 1) return "ayer";
    return `hace ${days} dias`;
}