import * as React from "react";
import { Head, usePage, router, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import PostCard from "@/Components/PostCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { MapPin, Calendar, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Post, PaginatedData, ProfileUser, PageProps } from "@/types";

interface Props {
    profileUser: ProfileUser;
    posts: PaginatedData<Post>;
}

export default function ProfileShow({ profileUser, posts }: Props) {
    const { auth } = usePage<PageProps>().props;
    const isOwnProfile = auth.user?.id === profileUser.id;

    const handleFollow = () => {
        router.post(`/users/${profileUser.id}/follow`, {}, { preserveScroll: true });
    };

    const handleUnfollow = () => {
        router.delete(`/users/${profileUser.id}/follow`, { preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title={`${profileUser.name} (@${profileUser.username})`} />

            <div className="space-y-5">
                {/* Profile Header */}
                <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
                    {/* Cover gradient */}
                    <div className="h-32 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400" />

                    <div className="px-6 pb-6">
                        <div className="flex items-end gap-4 -mt-12 mb-4">
                            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                <AvatarImage src={profileUser.avatar ?? undefined} />
                                <AvatarFallback className="text-2xl">{profileUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0 pb-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-xl font-bold">{profileUser.name}</h1>
                                        <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
                                    </div>
                                    {!isOwnProfile && (
                                        profileUser.is_following ? (
                                            <Button variant="outline" size="sm" onClick={handleUnfollow}>
                                                Mengikuti
                                            </Button>
                                        ) : (
                                            <Button size="sm" onClick={handleFollow}>
                                                Ikuti
                                            </Button>
                                        )
                                    )}
                                    {isOwnProfile && (
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href="/profile/edit">Edit Profil</Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {profileUser.bio && (
                            <p className="text-sm mb-4">{profileUser.bio}</p>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-5">
                            <span className="text-sm">
                                <span className="font-bold">{profileUser.posts_count}</span>{" "}
                                <span className="text-muted-foreground">Post</span>
                            </span>
                            <Link href={`/profile/${profileUser.username}/followers`} className="text-sm hover:underline">
                                <span className="font-bold">{profileUser.followers_count}</span>{" "}
                                <span className="text-muted-foreground">Pengikut</span>
                            </Link>
                            <Link href={`/profile/${profileUser.username}/following`} className="text-sm hover:underline">
                                <span className="font-bold">{profileUser.following_count}</span>{" "}
                                <span className="text-muted-foreground">Mengikuti</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Posts */}
                {posts.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center">
                        <p className="text-muted-foreground">Belum ada postingan.</p>
                    </div>
                ) : (
                    posts.data.map((post) => <PostCard key={post.id} post={post} />)
                )}

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {posts.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? "#"}
                                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${link.active
                                        ? "bg-primary text-primary-foreground"
                                        : link.url
                                            ? "hover:bg-secondary"
                                            : "text-muted-foreground pointer-events-none"
                                    }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
