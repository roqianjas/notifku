import * as React from "react";
import { Head, usePage, useForm, router, Link } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent } from "@/Components/ui/card";
import { Separator } from "@/Components/ui/separator";
import { Heart, MessageCircle, Trash2, ArrowLeft, Reply } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { PostDetail, Comment, PageProps } from "@/types";

interface Props {
    post: PostDetail;
}

export default function PostShow({ post }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user!;

    const commentForm = useForm({ body: "", parent_id: null as number | null });
    const [replyTo, setReplyTo] = React.useState<{ id: number; name: string } | null>(null);

    const toggleLike = () => {
        if (post.is_liked) {
            router.delete(`/posts/${post.id}/like`, { preserveScroll: true });
        } else {
            router.post(`/posts/${post.id}/like`, {}, { preserveScroll: true });
        }
    };

    const submitComment = (e: React.FormEvent) => {
        e.preventDefault();
        commentForm.post(`/posts/${post.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.reset();
                setReplyTo(null);
            },
        });
    };

    const startReply = (comment: Comment) => {
        setReplyTo({ id: comment.id, name: comment.user.name });
        commentForm.setData("parent_id", comment.id);
    };

    const cancelReply = () => {
        setReplyTo(null);
        commentForm.setData("parent_id", null);
    };

    const deletePost = () => {
        if (confirm("Hapus postingan ini?")) {
            router.delete(`/posts/${post.id}`);
        }
    };

    const deleteComment = (commentId: number) => {
        if (confirm("Hapus komentar ini?")) {
            router.delete(`/comments/${commentId}`, { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
            <Head title={`Post oleh ${post.user.name}`} />

            <div className="space-y-4">
                {/* Back */}
                <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                    <ArrowLeft className="h-4 w-4" /> Kembali
                </Button>

                {/* Post */}
                <Card>
                    <CardContent className="p-5">
                        <div className="flex items-center gap-3 mb-4">
                            <Link href={`/profile/${post.user.username}`}>
                                <Avatar className="h-11 w-11">
                                    <AvatarImage src={post.user.avatar ?? undefined} />
                                    <AvatarFallback>{post.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1">
                                <Link href={`/profile/${post.user.username}`} className="font-semibold hover:text-primary transition-colors">
                                    {post.user.name}
                                </Link>
                                <p className="text-xs text-muted-foreground">
                                    @{post.user.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: idLocale })}
                                </p>
                            </div>
                            {post.user.id === user.id && (
                                <Button variant="ghost" size="icon" onClick={deletePost} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-4">{post.body}</p>

                        {post.image && (
                            <div className="mb-4 overflow-hidden rounded-lg">
                                <img src={post.image} alt="" className="w-full object-cover" />
                            </div>
                        )}

                        <Separator />

                        <div className="flex items-center gap-4 pt-3">
                            <button
                                onClick={toggleLike}
                                className={`flex items-center gap-1.5 text-sm transition-all cursor-pointer ${post.is_liked ? "text-red-500 font-medium" : "text-muted-foreground hover:text-red-500"}`}
                            >
                                <Heart className={`h-[18px] w-[18px] ${post.is_liked ? "fill-red-500" : ""}`} />
                                {post.likes_count}
                            </button>
                            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <MessageCircle className="h-[18px] w-[18px]" />
                                {post.comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0)}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Comment Form */}
                <Card>
                    <CardContent className="p-5">
                        <form onSubmit={submitComment}>
                            {replyTo && (
                                <div className="mb-3 flex items-center gap-2 text-sm text-primary">
                                    <Reply className="h-4 w-4" />
                                    Membalas {replyTo.name}
                                    <button type="button" onClick={cancelReply} className="ml-auto text-xs text-muted-foreground hover:text-foreground cursor-pointer">
                                        Batal
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarImage src={user.avatar ?? undefined} />
                                    <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex gap-2">
                                    <Textarea
                                        placeholder={replyTo ? `Balas ${replyTo.name}...` : "Tulis komentar..."}
                                        value={commentForm.data.body}
                                        onChange={(e) => commentForm.setData("body", e.target.value)}
                                        className="min-h-[44px] text-sm"
                                        maxLength={2000}
                                    />
                                    <Button type="submit" size="sm" disabled={commentForm.processing || !commentForm.data.body.trim()} className="self-end">
                                        Kirim
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Comments */}
                <div className="space-y-3">
                    {post.comments.map((comment) => (
                        <Card key={comment.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                    <Link href={`/profile/${comment.user.username}`}>
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={comment.user.avatar ?? undefined} />
                                            <AvatarFallback>{comment.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Link href={`/profile/${comment.user.username}`} className="text-sm font-semibold hover:text-primary">
                                                {comment.user.name}
                                            </Link>
                                            <span className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: idLocale })}
                                            </span>
                                        </div>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.body}</p>
                                        <div className="flex items-center gap-3 mt-2">
                                            <button onClick={() => startReply(comment)} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 cursor-pointer">
                                                <Reply className="h-3.5 w-3.5" /> Balas
                                            </button>
                                            {comment.user.id === user.id && (
                                                <button onClick={() => deleteComment(comment.id)} className="text-xs text-muted-foreground hover:text-destructive cursor-pointer">
                                                    Hapus
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                    <div className="ml-12 mt-3 space-y-3 border-l-2 border-primary/10 pl-4">
                                        {comment.replies.map((reply) => (
                                            <div key={reply.id} className="flex items-start gap-3">
                                                <Link href={`/profile/${reply.user.username}`}>
                                                    <Avatar className="h-7 w-7">
                                                        <AvatarImage src={reply.user.avatar ?? undefined} />
                                                        <AvatarFallback className="text-xs">{reply.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/profile/${reply.user.username}`} className="text-sm font-semibold hover:text-primary">
                                                            {reply.user.name}
                                                        </Link>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: idLocale })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mt-0.5 whitespace-pre-wrap">{reply.body}</p>
                                                    {reply.user.id === user.id && (
                                                        <button onClick={() => deleteComment(reply.id)} className="text-xs text-muted-foreground hover:text-destructive mt-1 cursor-pointer">
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
