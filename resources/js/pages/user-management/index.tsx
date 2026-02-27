import { Head, router, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import {
    Search,
    Plus,
    Upload,
    MoreHorizontal,
    Shield,
    KeyRound,
    Trash2,
    X,
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import Heading from '@/components/heading';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import InputError from '@/components/input-error';
import { useInitials } from '@/hooks/use-initials';
import type { User, PaginatedData } from '@/types/auth';
import type { BreadcrumbItem, SharedData } from '@/types';

type ClassOption = { grade: string; section: string };
type Filters = { role?: string; grade?: string; section?: string; search?: string };

type Props = {
    users: PaginatedData<User>;
    classes: ClassOption[];
    filters: Filters;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'User Management', href: '/user-management' },
];

const roleBadgeVariant: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    moderator: 'secondary',
    student: 'outline',
};

export default function UserManagement({ users, classes, filters }: Props) {
    const getInitials = useInitials();
    const { flash } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [addOpen, setAddOpen] = useState(false);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [roleDialogUser, setRoleDialogUser] = useState<User | null>(null);
    const [passwordDialogUser, setPasswordDialogUser] = useState<User | null>(null);

    // Add User form
    const [newUser, setNewUser] = useState({
        name: '',
        usn: '',
        role: 'student',
        password: '',
        grade: '',
        section: '',
    });
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});

    function handleSearch(e: FormEvent) {
        e.preventDefault();
        router.get(
            '/user-management',
            { ...filters, search },
            { preserveState: true },
        );
    }

    function setFilter(key: string, value: string) {
        const newFilters = { ...filters, [key]: value || undefined };
        if (key === 'class') {
            if (value) {
                const [grade, section] = value.split('||');
                newFilters.grade = grade;
                newFilters.section = section;
            } else {
                delete newFilters.grade;
                delete newFilters.section;
            }
            delete (newFilters as Record<string, unknown>)['class'];
        }
        router.get('/user-management', newFilters, { preserveState: true });
    }

    function handleAddUser(e: FormEvent) {
        e.preventDefault();
        router.post('/user-management', newUser, {
            preserveScroll: true,
            onSuccess: () => {
                setAddOpen(false);
                setNewUser({
                    name: '',
                    usn: '',
                    role: 'student',
                    password: '',
                    grade: '',
                    section: '',
                });
                setAddErrors({});
            },
            onError: (errs) => setAddErrors(errs),
        });
    }

    function handleUpload(e: FormEvent) {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
        if (!fileInput?.files?.length) return;

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        router.post('/user-management/upload', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setUploadOpen(false),
        });
    }

    function handleChangeRole(userId: number, role: string) {
        router.patch(
            `/user-management/${userId}/role`,
            { role },
            { preserveScroll: true, onSuccess: () => setRoleDialogUser(null) },
        );
    }

    function handleResetPassword(userId: number, password: string) {
        router.patch(
            `/user-management/${userId}/password`,
            { password },
            { preserveScroll: true, onSuccess: () => setPasswordDialogUser(null) },
        );
    }

    function handleDelete(userId: number) {
        if (!confirm('Are you sure you want to remove this user?')) return;
        router.delete(`/user-management/${userId}`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="User Management" />
            <div className="flex flex-col gap-4 p-4 md:p-6 max-w-5xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <Heading
                        variant="small"
                        title="User Management"
                        description="Manage all users in the system"
                    />
                    <div className="flex gap-2">
                        {/* Upload CSV Dialog */}
                        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Upload className="w-4 h-4 mr-1.5" />
                                    Upload List
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload Student List</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file with columns: Name,
                                        Grade - Section, USN. Default password
                                        will be the USN.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleUpload} className="space-y-4">
                                    <Input type="file" accept=".csv,.txt" />
                                    <Button type="submit" className="w-full">
                                        Upload
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Add User Dialog */}
                        <Dialog open={addOpen} onOpenChange={setAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="w-4 h-4 mr-1.5" />
                                    Add User
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New User</DialogTitle>
                                    <DialogDescription>
                                        Create a new user account.
                                    </DialogDescription>
                                </DialogHeader>
                                <form
                                    onSubmit={handleAddUser}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={newUser.name}
                                            onChange={(e) =>
                                                setNewUser({
                                                    ...newUser,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <InputError message={addErrors.name} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>USN</Label>
                                        <Input
                                            value={newUser.usn}
                                            onChange={(e) =>
                                                setNewUser({
                                                    ...newUser,
                                                    usn: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                        <InputError message={addErrors.usn} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Role</Label>
                                        <Select
                                            value={newUser.role}
                                            onValueChange={(v) =>
                                                setNewUser({
                                                    ...newUser,
                                                    role: v,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="student">
                                                    Student
                                                </SelectItem>
                                                <SelectItem value="moderator">
                                                    Moderator
                                                </SelectItem>
                                                <SelectItem value="admin">
                                                    Admin
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Password</Label>
                                        <Input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) =>
                                                setNewUser({
                                                    ...newUser,
                                                    password: e.target.value,
                                                })
                                            }
                                            required
                                            minLength={6}
                                        />
                                        <InputError
                                            message={addErrors.password}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="grid gap-2">
                                            <Label>Grade</Label>
                                            <Input
                                                value={newUser.grade}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        grade: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Grade 1"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Section</Label>
                                            <Input
                                                value={newUser.section}
                                                onChange={(e) =>
                                                    setNewUser({
                                                        ...newUser,
                                                        section: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g. Section A"
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full">
                                        Create User
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Upload Errors */}
                {flash?.upload_errors && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="p-3">
                            <p className="text-sm font-medium text-destructive mb-1">
                                Upload Errors:
                            </p>
                            <ul className="text-xs text-destructive space-y-0.5">
                                {flash.upload_errors.map(
                                    (err: string, i: number) => (
                                        <li key={i}>{err}</li>
                                    ),
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <form onSubmit={handleSearch} className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or USN..."
                            className="pl-9"
                        />
                    </form>
                    <Select
                        value={filters.role ?? ''}
                        onValueChange={(v) => setFilter('role', v)}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={
                            filters.grade && filters.section
                                ? `${filters.grade}||${filters.section}`
                                : ''
                        }
                        onValueChange={(v) => setFilter('class', v)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Classes</SelectItem>
                            {classes.map((c) => (
                                <SelectItem
                                    key={`${c.grade}-${c.section}`}
                                    value={`${c.grade}||${c.section}`}
                                >
                                    {c.grade} - {c.section}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Users Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="text-left p-3 font-medium">
                                        Name
                                    </th>
                                    <th className="text-left p-3 font-medium">
                                        USN
                                    </th>
                                    <th className="text-left p-3 font-medium">
                                        Role
                                    </th>
                                    <th className="text-left p-3 font-medium">
                                        Class
                                    </th>
                                    <th className="text-right p-3 font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="border-b last:border-0 hover:bg-muted/30"
                                    >
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                        {getInitials(
                                                            user.name,
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {user.usn}
                                        </td>
                                        <td className="p-3">
                                            <Badge
                                                variant={
                                                    roleBadgeVariant[
                                                        user.role
                                                    ] ?? 'outline'
                                                }
                                                className="text-xs capitalize"
                                            >
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-muted-foreground">
                                            {user.grade && user.section
                                                ? `${user.grade} - ${user.section}`
                                                : '—'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setRoleDialogUser(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        Change Role
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            setPasswordDialogUser(
                                                                user,
                                                            )
                                                        }
                                                    >
                                                        <KeyRound className="w-4 h-4 mr-2" />
                                                        Reset Password
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() =>
                                                            handleDelete(
                                                                user.id,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {users.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="p-6 text-center text-muted-foreground text-sm"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {users.links.map((link, i) => (
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

            {/* Change Role Dialog */}
            <ChangeRoleDialog
                user={roleDialogUser}
                onClose={() => setRoleDialogUser(null)}
                onSubmit={handleChangeRole}
            />

            {/* Reset Password Dialog */}
            <ResetPasswordDialog
                user={passwordDialogUser}
                onClose={() => setPasswordDialogUser(null)}
                onSubmit={handleResetPassword}
            />
        </AppLayout>
    );
}

function ChangeRoleDialog({
    user,
    onClose,
    onSubmit,
}: {
    user: User | null;
    onClose: () => void;
    onSubmit: (userId: number, role: string) => void;
}) {
    const [role, setRole] = useState('');

    if (!user) return null;

    return (
        <Dialog open={!!user} onOpenChange={() => onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change Role</DialogTitle>
                    <DialogDescription>
                        Change role for {user.name}
                    </DialogDescription>
                </DialogHeader>
                <Select value={role || user.role} onValueChange={setRole}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="student">Student</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    onClick={() => onSubmit(user.id, role || user.role)}
                    className="w-full"
                >
                    Update Role
                </Button>
            </DialogContent>
        </Dialog>
    );
}

function ResetPasswordDialog({
    user,
    onClose,
    onSubmit,
}: {
    user: User | null;
    onClose: () => void;
    onSubmit: (userId: number, password: string) => void;
}) {
    const [password, setPassword] = useState('');

    if (!user) return null;

    return (
        <Dialog open={!!user} onOpenChange={() => onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        Set a new password for {user.name}
                    </DialogDescription>
                </DialogHeader>
                <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    minLength={6}
                />
                <Button
                    onClick={() => onSubmit(user.id, password)}
                    disabled={password.length < 6}
                    className="w-full"
                >
                    Reset Password
                </Button>
            </DialogContent>
        </Dialog>
    );
}
