import { Head, Link } from '@inertiajs/react';
import { Users, Clock } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Group } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    groups: Group[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Groups', href: '/groups' },
];

function timeAgo(dateStr: string | undefined) {
    if (!dateStr) return 'No posts yet';
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function GroupsIndex({ groups }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Groups" />
            <div className="flex flex-col gap-4 p-4 md:p-6 max-w-4xl mx-auto w-full">
                <Heading
                    variant="small"
                    title="My Groups"
                    description="Subject groups you belong to"
                />

                {groups.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {groups.map((group) => (
                            <Card
                                key={group.id}
                                className="overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="h-2 bg-primary" />
                                <CardContent className="p-4 flex flex-col gap-3">
                                    <div>
                                        <h3 className="font-semibold text-sm leading-tight">
                                            {group.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {group.grade} - {group.section}
                                        </p>
                                    </div>

                                    {group.moderator && (
                                        <p className="text-xs text-muted-foreground">
                                            Moderator:{' '}
                                            <span className="font-medium text-foreground">
                                                {group.moderator.name}
                                            </span>
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="w-3.5 h-3.5" />
                                            {group.members_count ?? 0} members
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {timeAgo(
                                                group.posts?.[0]?.created_at,
                                            )}
                                        </span>
                                    </div>

                                    <Link href={`/groups/${group.id}`}>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs"
                                        >
                                            View Group
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">
                            You are not assigned to any groups yet.
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
