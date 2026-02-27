import { Transition } from '@headlessui/react';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Camera } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { useInitials } from '@/hooks/use-initials';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

export default function Profile({ status }: { status?: string }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const getInitials = useInitials();

    const [emergencyRelationship, setEmergencyRelationship] = useState(
        user.emergency_contact_relationship ?? '',
    );
    const [emergencyEmail, setEmergencyEmail] = useState(
        user.emergency_contact_email ?? '',
    );
    const [emergencyPhone, setEmergencyPhone] = useState(
        user.emergency_contact_phone ?? '',
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);
    const [saved, setSaved] = useState(false);

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files?.length) return;
        const formData = new FormData();
        formData.append('profile_photo', e.target.files[0]);
        formData.append('emergency_contact_relationship', emergencyRelationship);
        formData.append('emergency_contact_email', emergencyEmail);
        formData.append('emergency_contact_phone', emergencyPhone);

        router.patch('/settings/profile', formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setProcessing(true);
        setSaved(false);

        router.patch(
            '/settings/profile',
            {
                emergency_contact_relationship: emergencyRelationship,
                emergency_contact_email: emergencyEmail,
                emergency_contact_phone: emergencyPhone,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                },
                onError: (errs) => setErrors(errs),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile Settings</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Profile information"
                        description="View your profile and update contact information"
                    />

                    {/* Profile Card */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage
                                            src={
                                                user.profile_photo_path
                                                    ? `/storage/${user.profile_photo_path}`
                                                    : undefined
                                            }
                                        />
                                        <AvatarFallback className="bg-primary/10 text-primary text-lg">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1 cursor-pointer hover:bg-primary/90 transition-colors">
                                        <Camera className="w-3.5 h-3.5" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {user.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <Badge
                                            variant={
                                                user.role === 'admin'
                                                    ? 'default'
                                                    : user.role === 'moderator'
                                                      ? 'secondary'
                                                      : 'outline'
                                            }
                                            className="text-xs capitalize"
                                        >
                                            {user.role}
                                        </Badge>
                                        {user.grade && user.section && (
                                            <span className="text-xs text-muted-foreground">
                                                {user.grade} - {user.section}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">
                                        USN
                                    </span>
                                    <p className="font-medium">{user.usn}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        Name
                                    </span>
                                    <p className="font-medium">{user.name}</p>
                                </div>
                                {user.grade && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Grade
                                        </span>
                                        <p className="font-medium">
                                            {user.grade}
                                        </p>
                                    </div>
                                )}
                                {user.section && (
                                    <div>
                                        <span className="text-muted-foreground">
                                            Section
                                        </span>
                                        <p className="font-medium">
                                            {user.section}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Emergency Contact Form */}
                    <Heading
                        variant="small"
                        title="Emergency Contact"
                        description="Update your emergency contact details"
                    />

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="relationship">Relationship</Label>
                            <Input
                                id="relationship"
                                value={emergencyRelationship}
                                onChange={(e) =>
                                    setEmergencyRelationship(e.target.value)
                                }
                                placeholder="e.g. Parent, Guardian"
                            />
                            <InputError
                                message={
                                    errors.emergency_contact_relationship
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="emergency_email">Email</Label>
                            <Input
                                id="emergency_email"
                                type="email"
                                value={emergencyEmail}
                                onChange={(e) =>
                                    setEmergencyEmail(e.target.value)
                                }
                                placeholder="emergency@example.com"
                            />
                            <InputError
                                message={errors.emergency_contact_email}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="emergency_phone">
                                Phone Number
                            </Label>
                            <Input
                                id="emergency_phone"
                                value={emergencyPhone}
                                onChange={(e) =>
                                    setEmergencyPhone(e.target.value)
                                }
                                placeholder="+63 XXX XXX XXXX"
                            />
                            <InputError
                                message={errors.emergency_contact_phone}
                            />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>
                            <Transition
                                show={saved}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">
                                    Saved
                                </p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
