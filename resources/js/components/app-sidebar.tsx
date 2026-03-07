import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    PenSquare,
    Users2,
    UserCircle,
    Shield,
    UsersRound,
} from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage().props;
    const role = auth.user.role;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Create Post',
            href: '/posts/create',
            icon: PenSquare,
        },
        {
            title: 'My Groups',
            href: '/groups',
            icon: UsersRound,
        },
        {
            title: 'Profile',
            href: '/settings/profile',
            icon: UserCircle,
        },
    ];

    // Admin only: User Management
    if (role === 'admin') {
        mainNavItems.push({
            title: 'User Management',
            href: '/user-management',
            icon: Users2,
        });
    }

    // Admin and moderator: Moderation panel
    if (role === 'admin' || role === 'moderator') {
        mainNavItems.push({
            title: 'Moderation',
            href: '/moderation',
            icon: Shield,
        });
    }

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
