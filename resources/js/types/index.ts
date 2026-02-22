export interface User {
    id: number;
    name: string;
    username: string;
    email?: string;
    avatar: string | null;
    bio?: string | null;
}

export interface Post {
    id: number;
    body: string;
    image: string | null;
    created_at: string;
    user: User;
    likes_count: number;
    comments_count?: number;
    is_liked: boolean;
}

export interface Comment {
    id: number;
    body: string;
    created_at: string;
    user: User;
    replies?: Comment[];
}

export interface PostDetail extends Omit<Post, 'comments_count'> {
    comments: Comment[];
}

export interface Notification {
    id: string;
    type: string;
    data: {
        type: string;
        message: string;
        actor?: User;
        post_id?: number;
        comment_id?: number;
        parent_comment_id?: number;
        url: string | null;
    };
    read_at: string | null;
    created_at: string;
}

export interface ProfileUser extends User {
    posts_count: number;
    followers_count: number;
    following_count: number;
    is_following: boolean | null;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    next_page_url: string | null;
    prev_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

export interface PageProps {
    auth: {
        user: User | null;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
    unreadNotificationsCount: number;
    [key: string]: unknown;
}
