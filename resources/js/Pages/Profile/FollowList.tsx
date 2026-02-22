import * as React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { User, PaginatedData, PageProps } from "@/types";
import { router } from "@inertiajs/react";

interface Props {
    profileUser: { id: number; name: string; username: string };
    users: PaginatedData<User>;
    type: "followers" | "following";
}

export default function FollowList({ profileUser, users, type }: Props) {
    const { auth } = usePage<PageProps>().props;

    return (
        <AppLayout>
            <Head title={`${type === "followers" ? "Pengikut" : "Mengikuti"} — ${profileUser.name}`} />

            <div className="space-y-5">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5 -ml-2">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>

                <div className="rounded-xl border border-border/60 bg-white shadow-sm">
                    <div className="border-b border-border/50 px-5 py-4">
                        <h2 className="font-bold">
                            {type === "followers" ? "Pengikut" : "Mengikuti"} @{profileUser.username}
                        </h2>
                    </div>

                    {users.data.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            {type === "followers" ? "Belum ada pengikut." : "Belum mengikuti siapapun."}
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {users.data.map((u) => (
                                <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                                    <Link href={`/profile/${u.username}`}>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={u.avatar ?? undefined} />
                                            <AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/profile/${u.username}`} className="text-sm font-semibold hover:text-primary">
                                            {u.name}
                                        </Link>
                                        <p className="text-xs text-muted-foreground">@{u.username}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {users.links.map((link, i) => (
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
