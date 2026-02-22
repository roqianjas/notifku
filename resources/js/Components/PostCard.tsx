import * as React from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { Heart, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import type { Post, PageProps } from "@/types";

interface Props {
    post: Post;
}

export default function PostCard({ post }: Props) {
    const { auth } = usePage<PageProps>().props;

    const toggleLike = () => {
        if (post.is_liked) {
            router.delete(`/posts/${post.id}/like`, { preserveScroll: true });
        } else {
            router.post(`/posts/${post.id}/like`, {}, { preserveScroll: true });
        }
    };

    return (
        <div className="rounded-xl border border-border/60 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md">
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
                <Link href={`/profile/${post.user.username}`}>
                    <Avatar className="h-10 w-10 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
                        <AvatarImage src={post.user.avatar ?? undefined} />
                        <AvatarFallback>{post.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                    <Link
                        href={`/profile/${post.user.username}`}
                        className="font-semibold text-sm hover:text-primary transition-colors"
                    >
                        {post.user.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                        @{post.user.username} ·{" "}
                        {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: id,
                        })}
                    </p>
                </div>
            </div>

            {/* Body */}
            <Link href={`/post/${post.id}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">{post.body}</p>
                {post.image && (
                    <div className="mb-3 overflow-hidden rounded-xl">
                        <img
                            src={post.image}
                            alt="Post image"
                            className="w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                        />
                    </div>
                )}
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-1">
                <button
                    onClick={toggleLike}
                    className={`flex items-center gap-1.5 text-sm transition-all duration-200 ${post.is_liked
                            ? "text-red-500 font-medium"
                            : "text-muted-foreground hover:text-red-500"
                        }`}
                >
                    <Heart
                        className={`h-5 w-5 transition-all ${post.is_liked ? "fill-red-500 scale-110" : ""
                            }`}
                    />
                    {post.likes_count}
                </button>

                <Link
                    href={`/post/${post.id}`}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                    <MessageCircle className="h-5 w-5" />
                    {post.comments_count ?? 0}
                </Link>
            </div>
        </div>
    );
}
