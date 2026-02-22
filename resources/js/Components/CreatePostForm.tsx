import * as React from "react";
import { useForm } from "@inertiajs/react";
import { ImagePlus, X, Send } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import type { User } from "@/types";

interface Props {
    user: User;
}

export default function CreatePostForm({ user }: Props) {
    const { data, setData, post, processing, reset, errors } = useForm<{
        body: string;
        image: File | null;
    }>({
        body: "",
        image: null,
    });

    const [preview, setPreview] = React.useState<string | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData("image", file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData("image", null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post("/posts", {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            },
        });
    };

    return (
        <Card>
            <CardContent className="p-5">
                <form onSubmit={handleSubmit}>
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                            <AvatarImage src={user.avatar ?? undefined} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-3">
                            <Textarea
                                placeholder="Apa yang kamu pikirkan?"
                                value={data.body}
                                onChange={(e) => setData("body", e.target.value)}
                                className="min-h-[80px] border-0 p-0 text-sm focus-visible:ring-0 resize-none shadow-none"
                                maxLength={5000}
                            />
                            {errors.body && <p className="text-xs text-destructive">{errors.body}</p>}

                            {preview && (
                                <div className="relative inline-block">
                                    <img src={preview} alt="Preview" className="max-h-48 rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80 text-background hover:bg-foreground transition-colors cursor-pointer"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <ImagePlus className="h-5 w-5 text-primary" />
                                        Foto
                                    </Button>
                                </div>

                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={processing || !data.body.trim()}
                                >
                                    <Send className="h-4 w-4" />
                                    Posting
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
