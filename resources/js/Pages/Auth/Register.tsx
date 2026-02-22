import * as React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent } from "@/Components/ui/card";
import { Bell } from "lucide-react";

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        username: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/register");
    };

    return (
        <>
            <Head title="Daftar" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-purple-50 px-4 py-8">
                <div className="w-full max-w-sm">
                    {/* Logo */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-200/50">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            NotifKu
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">Buat akun baru</p>
                    </div>

                    {/* Form */}
                    <Card className="shadow-xl shadow-black/5">
                        <CardContent className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Lengkap</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="John Doe"
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={data.username}
                                        onChange={(e) => setData("username", e.target.value.toLowerCase())}
                                        placeholder="johndoe"
                                    />
                                    <p className="text-xs text-muted-foreground">Huruf kecil, angka, underscore, dan titik.</p>
                                    {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="kamu@email.com"
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
                                        placeholder="Min. 8 karakter"
                                    />
                                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData("password_confirmation", e.target.value)}
                                        placeholder="Ulangi password"
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? "Mendaftar..." : "Daftar"}
                                </Button>

                                <p className="text-center text-sm text-muted-foreground">
                                    Sudah punya akun?{" "}
                                    <Link href="/login" className="font-medium text-primary hover:underline">
                                        Masuk
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
