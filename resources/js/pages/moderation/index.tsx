import { Head, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import {
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Flag,
    Plus,
    X,
    AlertTriangle,
    Bot,
    Hand,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';
import { useInitials } from '@/hooks/use-initials';
import type { Post, FilteredKeyword, PaginatedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    posts: PaginatedData<Post>;
    keywords: FilteredKeyword[];
    activeTab: string;
    isAdmin: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Moderation', href: '/moderation' },
];

function timeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

const tabs = [
    { key: 'all', label: 'All Posts', icon: ShieldAlert },
    { key: 'system', label: 'Flagged by System', icon: Bot },
    { key: 'manual', label: 'Manually Flagged', icon: Hand },
] as const;

export default function Moderation({ posts, keywords, activeTab, isAdmin }: Props) {
    const getInitials = useInitials();
    const [newKeyword, setNewKeyword] = useState('');
    const [keywordError, setKeywordError] = useState('');

    function switchTab(tab: string) {
        router.get('/moderation', { tab }, { preserveState: true });
    }

    function handleApprove(postId: number) {
        router.post(`/moderation/${postId}/approve`, {}, { preserveScroll: true });
    }

    function handleDelete(postId: number) {
        if (!confirm('Delete this post permanently?')) return;
        router.post(`/moderation/${postId}/delete`, {}, { preserveScroll: true });
    }

    function handleFlag(postId: number) {
        router.post(`/moderation/${postId}/flag`, {}, { preserveScroll: true });
    }

    function handleAddKeyword(e: FormEvent) {
        e.preventDefault();
        if (!newKeyword.trim()) return;
        router.post(
            '/moderation/keywords',
            { keyword: newKeyword.trim() },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setNewKeyword('');
                    setKeywordError('');
                },
                onError: (errs) => setKeywordError(errs.keyword ?? ''),
            },
        );
    }

    function handleRemoveKeyword(id: number) {
        router.delete(`/moderation/keywords/${id}`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Moderation" />
            <div className="flex flex-col lg:flex-row gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full">
                {/* Main Content - Posts */}
                <div className="flex-1">
                    <Heading
                        variant="small"
                        title="Content Moderation"
                        description="Review and manage flagged content"
                    />

                    {/* Tabs */}
                    <div className="flex gap-1 border-b border-border pb-0 mt-4 mb-4">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => switchTab(tab.key)}
                                className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                                    activeTab === tab.key
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    <div className="space-y-3">
                        {posts.data.map((post) => (
                            <Card
                                key={post.id}
                                className={`overflow-hidden ${
                                    post.status === 'flagged'
                                        ? 'border-amber-300 dark:border-amber-700'
                                        : ''
                                }`}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                {getInitials(
                                                    post.user?.name ?? '',
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-medium text-sm">
                                                    {post.user?.name}
                                                </span>
                                                {post.group && (
                                                    <span className="text-xs text-muted-foreground">
                                                        in {post.group.name}
                                                    </span>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {timeAgo(post.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-sm mt-1 leading-relaxed">
                                                {post.content}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {post.status === 'flagged' && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-amber-600 border-amber-300 text-xs"
                                                >
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    {post.flag_type === 'system'
                                                        ? 'System'
                                                        : 'Manual'}
                                                </Badge>
                                            )}
                                            {post.status === 'approved' && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-green-600 border-green-300 text-xs"
                                                >
                                                    <ShieldCheck className="w-3 h-3 mr-1" />
                                                    Approved
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                                        {post.status === 'flagged' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-7"
                                                onClick={() =>
                                                    handleApprove(post.id)
                                                }
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                                                Approve
                                            </Button>
                                        )}
                                        {post.status === 'published' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs h-7 text-amber-600 hover:text-amber-700"
                                                onClick={() =>
                                                    handleFlag(post.id)
                                                }
                                            >
                                                <Flag className="w-3.5 h-3.5 mr-1" />
                                                Flag
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-xs h-7 text-destructive hover:text-destructive"
                                            onClick={() =>
                                                handleDelete(post.id)
                                            }
                                        >
                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {posts.data.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-sm">No posts to review.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {posts.last_page > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            {posts.links.map((link, i) => (
                                <button
                                    key={i}
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            { preserveState: true },
                                        )
                                    }
                                    disabled={!link.url}
                                    className={`px-3 py-1 text-sm rounded ${
                                        link.active
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Sidebar - Keyword Filter (admin only) */}
                {isAdmin && (
                <div className="w-full lg:w-72 flex-shrink-0">
                    <Card className="sticky top-6">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-sm mb-3">
                                Keyword Filter List
                            </h3>
                            <p className="text-xs text-muted-foreground mb-3">
                                Posts containing these keywords will be
                                automatically flagged.
                            </p>

                            <form
                                onSubmit={handleAddKeyword}
                                className="flex gap-2 mb-3"
                            >
                                <Input
                                    value={newKeyword}
                                    onChange={(e) =>
                                        setNewKeyword(e.target.value)
                                    }
                                    placeholder="Add keyword..."
                                    className="text-xs h-8"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="h-8 px-2"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </form>
                            <InputError message={keywordError} />

                            <div className="space-y-1.5 max-h-64 overflow-y-auto">
                                {keywords.map((kw) => (
                                    <div
                                        key={kw.id}
                                        className="flex items-center justify-between bg-muted/50 rounded px-2.5 py-1.5"
                                    >
                                        <span className="text-xs font-medium">
                                            {kw.keyword}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handleRemoveKeyword(kw.id)
                                            }
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                                {keywords.length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-2">
                                        No keywords added yet.
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
                )}
            </div>
        </AppLayout>
    );
}
