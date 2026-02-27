import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { MessageCircle, Heart, Megaphone, ChevronRight } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useInitials } from '@/hooks/use-initials';
import type { Post, PaginatedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    posts: PaginatedData<Post>;
    announcements: Post[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

function timeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} Minutes Ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} Hours Ago`;
    return `${Math.floor(diff / 86400)} Days Ago`;
}

function PostCard({ post }: { post: Post }) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');

    const userReacted = post.reactions?.some(
        (r) => r.user_id === auth.user.id,
    );
    const reactionCount = post.reactions?.length ?? 0;

    function handleReact() {
        router.post(`/posts/${post.id}/react`, {}, { preserveScroll: true });
    }

    function handleComment(e: React.FormEvent) {
        e.preventDefault();
        if (!newComment.trim()) return;
        router.post(
            `/posts/${post.id}/comments`,
            { content: newComment },
            {
                preserveScroll: true,
                onSuccess: () => setNewComment(''),
            },
        );
    }

    return (
        <Card className="mb-4 overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={
                                post.user?.profile_photo_path
                                    ? `/storage/${post.user.profile_photo_path}`
                                    : undefined
                            }
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {getInitials(post.user?.name ?? '')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                                {post.user?.name}
                            </span>
                            {post.user?.role === 'moderator' && (
                                <Badge
                                    variant="secondary"
                                    className="text-xs px-1.5 py-0"
                                >
                                    {post.user?.grade} - {post.user?.section}
                                </Badge>
                            )}
                            {post.user?.role === 'admin' && (
                                <Badge
                                    variant="default"
                                    className="text-xs px-1.5 py-0"
                                >
                                    Admin
                                </Badge>
                            )}
                        </div>
                        {post.group && (
                            <span className="text-xs text-muted-foreground">
                                {post.group.name}
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-2">
                            {timeAgo(post.created_at)}
                        </span>
                    </div>
                    {post.is_announcement && (
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">
                            <Megaphone className="w-3 h-3 mr-1" />
                            Announcement
                        </Badge>
                    )}
                </div>

                <p className="mt-3 text-sm leading-relaxed">{post.content}</p>

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                    <button
                        onClick={handleReact}
                        className={`flex items-center gap-1.5 text-xs transition-colors ${
                            userReacted
                                ? 'text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        <Heart
                            className={`w-4 h-4 ${userReacted ? 'fill-primary' : ''}`}
                        />
                        {reactionCount > 0 && reactionCount}
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <MessageCircle className="w-4 h-4" />
                        {post.comments?.length ?? 0} Comments
                    </button>
                </div>

                {showComments && (
                    <div className="mt-3 space-y-2">
                        {post.comments?.map((comment) => (
                            <div
                                key={comment.id}
                                className="flex items-start gap-2 bg-muted/50 rounded-lg p-2"
                            >
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {getInitials(comment.user?.name ?? '')}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <span className="text-xs font-medium">
                                        {comment.user?.name}
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        {comment.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <form
                            onSubmit={handleComment}
                            className="flex gap-2 mt-2"
                        >
                            <Input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Write a comment..."
                                className="text-xs h-8"
                            />
                            <Button
                                type="submit"
                                size="sm"
                                className="h-8 text-xs"
                            >
                                Post
                            </Button>
                        </form>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function Dashboard({ posts, announcements }: Props) {
    const [activeTab, setActiveTab] = useState<
        'all' | 'announcements' | 'groups' | 'my-posts'
    >('all');
    const { auth } = usePage().props;

    const displayPosts =
        activeTab === 'announcements'
            ? posts.data.filter((p) => p.is_announcement)
            : activeTab === 'my-posts'
              ? posts.data.filter((p) => p.user_id === auth.user.id)
              : posts.data;

    const tabs = [
        { key: 'all', label: 'All' },
        { key: 'announcements', label: 'Announcements' },
        { key: 'groups', label: 'My Groups' },
        { key: 'my-posts', label: 'My Posts' },
    ] as const;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-4 p-4 md:p-6 max-w-3xl mx-auto w-full">
                {/* Tab Navigation */}
                <div className="flex gap-1 border-b border-border pb-0">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 text-sm font-medium transition-colors rounded-t-lg ${
                                activeTab === tab.key
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Announcements Banner */}
                {announcements.length > 0 && activeTab === 'all' && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Megaphone className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-semibold">
                                    Announcements
                                </h3>
                            </div>
                            <div className="space-y-1.5">
                                {announcements.slice(0, 3).map((a) => (
                                    <div
                                        key={a.id}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-primary">
                                                •
                                            </span>
                                            <span className="font-medium">
                                                {a.user?.name}
                                            </span>
                                            <span className="text-muted-foreground">
                                                :{' '}
                                                {a.content.slice(0, 60)}
                                                {a.content.length > 60
                                                    ? '...'
                                                    : ''}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground whitespace-nowrap ml-2">
                                            {timeAgo(a.created_at)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            {announcements.length > 3 && (
                                <button
                                    onClick={() =>
                                        setActiveTab('announcements')
                                    }
                                    className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline"
                                >
                                    View all announcements
                                    <ChevronRight className="w-3 h-3" />
                                </button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Posts Feed */}
                <div>
                    {displayPosts.length > 0 ? (
                        displayPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-sm">No posts yet</p>
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
                                    router.get(link.url, {}, { preserveState: true })
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
        </AppLayout>
    );
}
