import * as React from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Bell, Home, LogOut, User, PenSquare } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Toaster, toast } from "sonner";
import type { PageProps } from "@/types";

interface Props {
    children: React.ReactNode;
}

export default function AppLayout({ children }: Props) {
    const { auth, flash, unreadNotificationsCount } = usePage<PageProps>().props;
    const user = auth.user;

    React.useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Listen for real-time notifications
    React.useEffect(() => {
        if (!user) return;

        const channel = window.Echo.private(`App.Models.User.${user.id}`);

        channel.notification((notification: any) => {
            toast(notification.message, {
                description: "Baru saja",
                action: notification.url
                    ? {
                        label: "Lihat",
                        onClick: () => router.visit(notification.url),
                    }
                    : undefined,
            });

            // Force Inertia to reload shared data
            router.reload({ only: ["unreadNotificationsCount"] });
        });

        return () => {
            window.Echo.leave(`App.Models.User.${user.id}`);
        };
    }, [user]);

    const handleLogout = () => {
        router.post("/logout");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            <Toaster position="top-right" richColors closeButton />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-border/50 bg-white/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
                    <Link href="/feed" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200">
                            <Bell className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            NotifKu
                        </span>
                    </Link>

                    {user && (
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/feed">
                                    <Home className="h-5 w-5" />
                                </Link>
                            </Button>

                            <Button variant="ghost" size="icon" className="relative" asChild>
                                <Link href="/notifications">
                                    <Bell className="h-5 w-5" />
                                    {unreadNotificationsCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-in zoom-in">
                                            {unreadNotificationsCount > 99 ? "99+" : unreadNotificationsCount}
                                        </span>
                                    )}
                                </Link>
                            </Button>

                            <Button variant="ghost" size="icon" asChild>
                                <Link href={`/profile/${user.username}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar ?? undefined} />
                                        <AvatarFallback className="text-xs">
                                            {user.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            </Button>

                            <Button variant="ghost" size="icon" onClick={handleLogout}>
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </nav>

            {/* Main Content */}
            <main className="mx-auto max-w-2xl px-4 py-6">
                {children}
            </main>
        </div>
    );
}
