<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $followingIds = $user->following()->pluck('users.id')->toArray();
        $followingIds[] = $user->id;

        $posts = Post::with([
            'user:id,name,username,avatar',
            'likes',
            'comments',
        ])
            ->whereIn('user_id', $followingIds)
            ->latest()
            ->paginate(20);

        $posts->getCollection()->transform(function ($post) use ($user) {
            return [
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
                'comments_count' => $post->comments->count(),
                'is_liked' => $post->likes->contains('user_id', $user->id),
            ];
        });

        return Inertia::render('Feed', [
            'posts' => $posts,
        ]);
    }
}
