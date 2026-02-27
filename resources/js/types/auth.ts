export type UserRole = 'admin' | 'moderator' | 'student';

export type User = {
    id: number;
    name: string;
    usn: string;
    email: string | null;
    role: UserRole;
    grade: string | null;
    section: string | null;
    profile_photo_path: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_email: string | null;
    emergency_contact_phone: string | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Group = {
    id: number;
    name: string;
    grade: string;
    section: string;
    moderator_id: number | null;
    moderator?: User;
    members_count?: number;
    posts?: Post[];
    created_at: string;
    updated_at: string;
};

export type Post = {
    id: number;
    user_id: number;
    group_id: number | null;
    content: string;
    is_announcement: boolean;
    status: string;
    flag_type: string | null;
    user?: User;
    group?: Group;
    attachments?: PostAttachment[];
    comments?: Comment[];
    reactions?: Reaction[];
    reactions_count?: number;
    created_at: string;
    updated_at: string;
};

export type PostAttachment = {
    id: number;
    post_id: number;
    file_path: string;
    file_type: string;
    original_name: string;
};

export type Comment = {
    id: number;
    post_id: number;
    user_id: number;
    content: string;
    user?: User;
    created_at: string;
};

export type Reaction = {
    id: number;
    post_id: number;
    user_id: number;
    type: string;
};

export type FilteredKeyword = {
    id: number;
    keyword: string;
    created_by: number;
    creator?: User;
    created_at: string;
};

export type PaginatedData<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
