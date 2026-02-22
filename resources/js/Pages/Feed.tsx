import * as React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import PostCard from "@/Components/PostCard";
import CreatePostForm from "@/Components/CreatePostForm";
import { Card, CardContent } from "@/Components/ui/card";
import { Inbox } from "lucide-react";
import type { Post, PaginatedData, PageProps } from "@/types";

interface Props {
    posts: PaginatedData<Post>;
}

export default function Feed({ posts }: Props) {
    const { auth } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title="Feed" />

            <div className="space-y-4">
                {/* Create Post */}
                {auth.user && <CreatePostForm user={auth.user} />}

                {/* Posts */}
                {posts.data.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Inbox className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Belum ada postingan</h3>
                            <p className="text-sm text-muted-foreground">
                                Ikuti pengguna lain untuk melihat postingan mereka di feed.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    posts.data.map((post) => <PostCard key={post.id} post={post} />)
                )}

                {/* Pagination */}
                {posts.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-4">
                        {posts.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? "#"}
                                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm transition-colors ${link.active
                                        ? "bg-primary text-primary-foreground"
                                        : link.url
                                            ? "hover:bg-accent hover:text-accent-foreground"
                                            : "text-muted-foreground pointer-events-none opacity-50"
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
