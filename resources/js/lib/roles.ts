export function roleBadgeClass(role: string | null | undefined): string {
    if (role === 'admin') {
        return 'border border-rose-200 bg-rose-100 text-rose-700';
    }

    if (role === 'moderator') {
        return 'border border-sky-200 bg-sky-100 text-sky-700';
    }

    return 'border border-emerald-200 bg-emerald-100 text-emerald-700';
}

export function roleLabel(role: string | null | undefined): string {
    if (!role) return 'User';

    if (role === 'moderator') return 'Moderator';

    return role.charAt(0).toUpperCase() + role.slice(1);
}
