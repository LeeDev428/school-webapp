import { Head, router, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { FileUp, X } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import InputError from '@/components/input-error';
import type { Group } from '@/types/auth';
import type { BreadcrumbItem } from '@/types';

type Props = {
    groups: Group[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Create Post', href: '/posts/create' },
];

export default function CreatePost({ groups }: Props) {
    const { auth } = usePage().props;
    const [content, setContent] = useState('');
    const [groupId, setGroupId] = useState('');
    const [isAnnouncement, setIsAnnouncement] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    }

    function removeFile(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('content', content);
        formData.append('group_id', groupId);
        formData.append('is_announcement', isAnnouncement ? '1' : '0');
        files.forEach((file) => formData.append('attachments[]', file));

        router.post('/posts', formData, {
            forceFormData: true,
            onError: (errs) => {
                setErrors(errs);
                setProcessing(false);
            },
            onSuccess: () => setProcessing(false),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />
            <div className="flex flex-col gap-4 p-4 md:p-6 max-w-2xl mx-auto w-full">
                <Heading
                    variant="small"
                    title="Create Post"
                    description="Share something with your group"
                />

                <Card>
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Group Selector */}
                            <div className="grid gap-2">
                                <Label htmlFor="group">Group</Label>
                                <Select
                                    value={groupId}
                                    onValueChange={setGroupId}
                                >
                                    <SelectTrigger id="group">
                                        <SelectValue placeholder="Select a group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem
                                                key={group.id}
                                                value={String(group.id)}
                                            >
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.group_id} />
                            </div>

                            {/* Content */}
                            <div className="grid gap-2">
                                <Label htmlFor="content">Content</Label>
                                <Textarea
                                    id="content"
                                    value={content}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                        setContent(e.target.value)
                                    }
                                    placeholder="What's on your mind?"
                                    rows={5}
                                    className="resize-none"
                                />
                                <InputError message={errors.content} />
                            </div>

                            {/* Announcement Toggle (non-students) */}
                            {auth.user.role !== 'student' && (
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="announcement"
                                        checked={isAnnouncement}
                                        onCheckedChange={(v) =>
                                            setIsAnnouncement(v === true)
                                        }
                                    />
                                    <Label
                                        htmlFor="announcement"
                                        className="text-sm cursor-pointer"
                                    >
                                        Post as Announcement
                                    </Label>
                                </div>
                            )}

                            {/* File Upload */}
                            <div className="grid gap-2">
                                <Label>Attachments</Label>
                                <label className="flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                                    <FileUp className="w-5 h-5 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                        Click to upload files
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleFiles}
                                    />
                                </label>
                                {files.length > 0 && (
                                    <div className="space-y-1 mt-1">
                                        {files.map((file, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between bg-muted/50 rounded px-3 py-1.5 text-sm"
                                            >
                                                <span className="truncate">
                                                    {file.name}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        removeFile(i)
                                                    }
                                                    className="text-muted-foreground hover:text-destructive"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.get('/dashboard')}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !content || !groupId}
                                >
                                    {processing ? 'Posting...' : 'Post'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
