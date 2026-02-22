import * as React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import PostCard from "@/Components/PostCard";
import CreatePostForm from "@/Components/CreatePostForm";
import type { Post, PaginatedData, PageProps } from "@/types";

interface Props {
    posts: PaginatedData<Post>;
}

export default function Feed({ posts }: Props) {
    const { auth } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title="Feed" />

            <div className="space-y-5">
                {/* Create Post */}
                {auth.user && <CreatePostForm user={auth.user} />}

                {/* Posts */}
                {posts.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Belum ada postingan</h3>
                        <p className="text-sm text-muted-foreground">
                            Ikuti pengguna lain untuk melihat postingan mereka di feed.
                        </p>
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
