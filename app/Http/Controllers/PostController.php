<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Notifications\PostCommentedNotification;
use App\Notifications\PostLikedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PostController extends Controller
{
    public function show(Post $post, Request $request)
    {
        $user = $request->user();

        $post->load([
            'user:id,name,username,avatar',
            'likes',
            'rootComments' => function ($query) {
                $query->with([
                    'user:id,name,username,avatar',
                    'replies' => function ($q) {
                        $q->with('user:id,name,username,avatar')->oldest();
                    },
                ])->oldest();
            },
        ]);

        return Inertia::render('Post/Show', [
            'post' => [
                'id' => $post->id,
                'body' => $post->body,
                'image' => $post->image_url,
                'created_at' => $post->created_at,
                'user' => [
                    'id' => $post->user->id,
                    'name' => $post->user->name,
                    'username' => $post->user->username,
                    'avatar' => $post->user->avatar_url,
                ],
                'likes_count' => $post->likes->count(),
                'is_liked' => $post->likes->contains('user_id', $user->id),
                'comments' => $post->rootComments->map(function ($comment) {
                    return [
                        'id' => $comment->id,
                        'body' => $comment->body,
                        'created_at' => $comment->created_at,
                        'user' => [
                            'id' => $comment->user->id,
                            'name' => $comment->user->name,
                            'username' => $comment->user->username,
                            'avatar' => $comment->user->avatar_url,
                        ],
                        'replies' => $comment->replies->map(function ($reply) {
                            return [
                                'id' => $reply->id,
                                'body' => $reply->body,
                                'created_at' => $reply->created_at,
                                'user' => [
                                    'id' => $reply->user->id,
                                    'name' => $reply->user->name,
                                    'username' => $reply->user->username,
                                    'avatar' => $reply->user->avatar_url,
                                ],
                            ];
                        }),
                    ];
                }),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'body' => 'required|string|max:5000',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp,gif|max:5120',
        ]);

        $data = [
            'user_id' => $request->user()->id,
            'body' => $request->body,
        ];

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('posts', 'public');
        }

        Post::create($data);

        return redirect()->back()->with('success', 'Post berhasil dibuat!');
    }

    public function destroy(Post $post, Request $request)
    {
        if ($post->user_id !== $request->user()->id) {
            abort(403);
        }

        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return redirect()->route('feed')->with('success', 'Post berhasil dihapus!');
    }
}
