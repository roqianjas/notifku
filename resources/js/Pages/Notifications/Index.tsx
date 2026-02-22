import * as React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { Bell, CheckCheck, UserPlus, Heart, MessageCircle, Reply, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { Notification, PaginatedData } from "@/types";

interface Props {
    notifications: PaginatedData<Notification>;
}

const iconMap: Record<string, React.ReactNode> = {
    "user.follow": <UserPlus className="h-4 w-4 text-blue-500" />,
    "post.liked": <Heart className="h-4 w-4 text-red-500" />,
    "post.commented": <MessageCircle className="h-4 w-4 text-green-500" />,
    "comment.replied": <Reply className="h-4 w-4 text-purple-500" />,
    "system.announcement": <Megaphone className="h-4 w-4 text-amber-500" />,
};

export default function NotificationsIndex({ notifications }: Props) {
    const markAllAsRead = () => {
        router.patch("/notifications/read-all", {}, { preserveScroll: true });
    };

    const handleClick = (notification: Notification) => {
        // Mark as read
        if (!notification.read_at) {
            router.patch(`/notifications/${notification.id}`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    if (notification.data.url) {
                        router.visit(notification.data.url);
                    }
                },
            });
        } else if (notification.data.url) {
            router.visit(notification.data.url);
        }
    };

    return (
        <AppLayout>
            <Head title="Notifikasi" />

            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">Notifikasi</h1>
                    </div>
                    {notifications.data.some((n) => !n.read_at) && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-1.5 text-primary">
                            <CheckCheck className="h-4 w-4" />
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border p-12 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <Bell className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Belum ada notifikasi</h3>
                        <p className="text-sm text-muted-foreground">
                            Notifikasi dari aktivitas sosial akan muncul di sini.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-xl border border-border/60 bg-white shadow-sm divide-y divide-border/50">
                        {notifications.data.map((notification) => (
                            <button
                                key={notification.id}
                                onClick={() => handleClick(notification)}
                                className={`flex items-start gap-3 w-full px-5 py-4 text-left transition-colors hover:bg-accent/40 ${!notification.read_at ? "bg-primary/[0.03]" : ""
                                    }`}
                            >
                                {/* Actor avatar or icon */}
                                <div className="relative shrink-0">
                                    {notification.data.actor ? (
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={notification.data.actor.avatar ?? undefined} />
                                            <AvatarFallback>{notification.data.actor.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            {iconMap[notification.data.type] ?? <Bell className="h-4 w-4" />}
                                        </div>
                                    )}
                                    {/* Type badge */}
                                    {notification.data.actor && (
                                        <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white border border-border shadow-sm">
                                            {iconMap[notification.data.type] ?? <Bell className="h-3 w-3" />}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm ${!notification.read_at ? "font-medium" : "text-muted-foreground"}`}>
                                        {notification.data.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {formatDistanceToNow(new Date(notification.created_at), {
                                            addSuffix: true,
                                            locale: idLocale,
                                        })}
                                    </p>
                                </div>

                                {/* Unread indicator */}
                                {!notification.read_at && (
                                    <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                        {notifications.links.map((link, i) => (
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
