import * as React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { ArrowLeft } from "lucide-react";
import type { User, PaginatedData, PageProps } from "@/types";

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

            <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>

                <Card>
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base">
                            {type === "followers" ? "Pengikut" : "Mengikuti"} @{profileUser.username}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 pt-4">
                        {users.data.length === 0 ? (
                            <div className="px-6 pb-6 text-center text-muted-foreground">
                                {type === "followers" ? "Belum ada pengikut." : "Belum mengikuti siapapun."}
                            </div>
                        ) : (
                            <div>
                                {users.data.map((u, i) => (
                                    <React.Fragment key={u.id}>
                                        {i > 0 && <Separator />}
                                        <div className="flex items-center gap-3 px-6 py-3">
                                            <Link href={`/profile/${u.username}`}>
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={u.avatar ?? undefined} />
                                                    <AvatarFallback>{u.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/profile/${u.username}`} className="text-sm font-semibold hover:text-primary transition-colors">
                                                    {u.name}
                                                </Link>
                                                <p className="text-xs text-muted-foreground">@{u.username}</p>
                                            </div>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {users.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-4">
                        {users.links.map((link, i) => (
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
