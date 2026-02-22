import * as React from "react";
import { Head, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Camera, ArrowLeft } from "lucide-react";
import type { User } from "@/types";

interface Props {
    user: User;
}

export default function ProfileEdit({ user }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        username: user.username,
        bio: user.bio ?? "",
        avatar: null as File | null,
    });

    const [preview, setPreview] = React.useState<string | null>(user.avatar);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("avatar", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Use post with _method override for file upload with PATCH
        const formData = new FormData();
        formData.append("_method", "PATCH");
        formData.append("name", data.name);
        formData.append("username", data.username);
        formData.append("bio", data.bio);
        if (data.avatar) formData.append("avatar", data.avatar);

        // @ts-ignore
        patch("/profile", {
            forceFormData: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Edit Profil" />

            <div className="space-y-5">
                <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5 -ml-2">
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>

                <div className="rounded-xl border border-border/60 bg-white p-6 shadow-sm">
                    <h2 className="text-lg font-bold mb-6">Edit Profil</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar */}
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={preview ?? undefined} />
                                    <AvatarFallback className="text-xl">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium">Foto Profil</p>
                                <p className="text-xs text-muted-foreground">JPG, PNG, WebP. Maks 2MB.</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        {errors.avatar && <p className="text-xs text-destructive">{errors.avatar}</p>}

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nama</label>
                            <Input
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                            />
                            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                        </div>

                        {/* Username */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                value={data.username}
                                onChange={(e) => setData("username", e.target.value.toLowerCase())}
                            />
                            {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
                        </div>

                        {/* Bio */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                                value={data.bio}
                                onChange={(e) => setData("bio", e.target.value)}
                                placeholder="Ceritakan tentang dirimu..."
                                maxLength={160}
                                className="min-h-[80px]"
                            />
                            <p className="text-xs text-muted-foreground text-right">{data.bio.length}/160</p>
                            {errors.bio && <p className="text-xs text-destructive">{errors.bio}</p>}
                        </div>

                        <Button type="submit" disabled={processing}>
                            {processing ? "Menyimpan..." : "Simpan Perubahan"}
                        </Button>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
