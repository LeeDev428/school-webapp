import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { MessageCircle, Heart, Users, ArrowLeft, MoreHorizontal, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useInitials } from '@/hooks/use-initials';
import type { Group, Post, PaginatedData } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    group: Group & { members_count: number };
    posts: PaginatedData<Post>;
};

function timeAgo(dateStr: string) {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
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

    function handleDelete() {
        if (!confirm('Delete this post?')) return;
        router.delete(`/posts/${post.id}`, { preserveScroll: true });
    }

    return (
        <Card className="mb-4 overflow-hidden border-border/50 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                        <AvatarImage
                            src={
                                post.user?.profile_photo_path
                                    ? `/storage/${post.user.profile_photo_path}`
                                    : undefined
                            }
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(post.user?.name ?? '')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <span className="font-medium text-sm">
                            {post.user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                            {timeAgo(post.created_at)}
                        </span>
                    </div>
                    {(auth.user.role === 'admin' || post.user_id === auth.user.id) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={handleDelete}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Post
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
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

export default function GroupShow({ group, posts }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'My Groups', href: '/groups' },
        { title: group.name, href: `/groups/${group.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={group.name} />
            <div className="flex flex-col gap-4 p-4 md:p-6 max-w-3xl mx-auto w-full">
                {/* Group Header */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.get('/groups')}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold">{group.name}</h2>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>
                                {group.grade} - {group.section}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {group.members_count} members
                            </span>
                            {group.moderator && (
                                <span>
                                    Moderator:{' '}
                                    <span className="font-medium">
                                        {group.moderator.name}
                                    </span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Posts Feed */}
                <div>
                    {posts.data.length > 0 ? (
                        posts.data.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-sm">
                                No posts in this group yet.
                            </p>
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
