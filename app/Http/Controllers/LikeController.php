<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Notifications\PostLikedNotification;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    public function store(Post $post, Request $request)
    {
        $user = $request->user();

        if ($user->hasLiked($post)) {
            return back();
        }

        $post->likes()->create(['user_id' => $user->id]);

        // Notify post owner (self-exclusion)
        if ($post->user_id !== $user->id) {
            $post->user->notify(new PostLikedNotification($user, $post));
        }

        return back();
    }

    public function destroy(Post $post, Request $request)
    {
        $request->user()->likes()->where('post_id', $post->id)->delete();

        return back();
    }
}
