import * as React from "react";
import { Head, Link, router } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
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

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-6 w-6 text-primary" />
                        <h1 className="text-xl font-bold">Notifikasi</h1>
                    </div>
                    {notifications.data.some((n) => !n.read_at) && (
                        <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-primary">
                            <CheckCheck className="h-4 w-4" />
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>

                {notifications.data.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                <Bell className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-1">Belum ada notifikasi</h3>
                            <p className="text-sm text-muted-foreground">
                                Notifikasi dari aktivitas sosial akan muncul di sini.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            {notifications.data.map((notification, i) => (
                                <React.Fragment key={notification.id}>
                                    {i > 0 && <Separator />}
                                    <button
                                        onClick={() => handleClick(notification)}
                                        className={`flex items-start gap-3 w-full px-5 py-4 text-left transition-colors hover:bg-accent/50 cursor-pointer ${!notification.read_at ? "bg-primary/3" : ""
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
                                                <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border shadow-xs">
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
                                            <Badge variant="default" className="h-2.5 w-2.5 rounded-full p-0 shrink-0 mt-2 animate-pulse" />
                                        )}
                                    </button>
                                </React.Fragment>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-4">
                        {notifications.links.map((link, i) => (
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
