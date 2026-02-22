import * as React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Bell } from "lucide-react";

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/login");
    };

    return (
        <>
            <Head title="Login" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200/50">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            NotifKu
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Masuk ke akunmu</p>
                    </div>

                    {/* Form */}
                    <Card className="shadow-xl shadow-black/5">
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="kamu@email.com"
                                        autoFocus
                                    />
                                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData("remember", e.target.checked)}
                                        className="rounded border-input"
                                    />
                                    <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                                        Ingat saya
                                    </Label>
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? "Masuk..." : "Masuk"}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Belum punya akun?{" "}
                                    <Link href="/register" className="font-medium text-primary hover:underline">
                                        Daftar
                                    </Link>
                                </p>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
