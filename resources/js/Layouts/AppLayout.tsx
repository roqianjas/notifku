import * as React from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Bell, Home, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
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
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50/30">
            <Toaster position="top-right" richColors closeButton />

            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
                    <Link href="/feed" className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200/50">
                            <Bell className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            NotifKu
                        </span>
                    </Link>

                    {user && (
                        <div className="flex items-center gap-1">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" asChild>
                                        <Link href="/feed">
                                            <Home className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Feed</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative" asChild>
                                        <Link href="/notifications">
                                            <Bell className="h-5 w-5" />
                                            {unreadNotificationsCount > 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="absolute -top-1 -right-1 h-5 min-w-5 justify-center px-1 text-[10px] font-bold"
                                                >
                                                    {unreadNotificationsCount > 99
                                                        ? "99+"
                                                        : unreadNotificationsCount}
                                                </Badge>
                                            )}
                                        </Link>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Notifikasi</TooltipContent>
                            </Tooltip>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar ?? undefined} />
                                            <AvatarFallback>
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/${user.username}`} className="cursor-pointer">
                                            <UserIcon className="mr-2 h-4 w-4" />
                                            Profil Saya
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile/edit" className="cursor-pointer">
                                            <Settings className="mr-2 h-4 w-4" />
                                            Edit Profil
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Keluar
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
