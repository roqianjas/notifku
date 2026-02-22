<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function show(User $user, Request $request)
    {
        $currentUser = $request->user();

        $posts = $user->posts()
            ->with(['likes', 'comments'])
            ->latest()
            ->paginate(20);

        $posts->getCollection()->transform(function ($post) use ($currentUser) {
            return [
                'id' => $post->id,
                'body' => $post->body,
                'image' => $post->image_url,
                'created_at' => $post->created_at,
                'user' => [
                    'id' => $post->user_id,
                    'name' => $post->user->name ?? $post->user->name,
                    'username' => $post->user->username ?? '',
                    'avatar' => $post->user->avatar_url ?? null,
                ],
                'likes_count' => $post->likes->count(),
                'comments_count' => $post->comments->count(),
                'is_liked' => $post->likes->contains('user_id', $currentUser->id),
            ];
        });

        return Inertia::render('Profile/Show', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar_url,
                'bio' => $user->bio,
                'posts_count' => $user->posts()->count(),
                'followers_count' => $user->followers()->count(),
                'following_count' => $user->following()->count(),
                'is_following' => $currentUser->id !== $user->id
                    ? $currentUser->isFollowing($user)
                    : null,
            ],
            'posts' => $posts,
        ]);
    }

    public function edit(Request $request)
    {
        return Inertia::render('Profile/Edit', [
            'user' => [
                'name' => $request->user()->name,
                'username' => $request->user()->username,
                'email' => $request->user()->email,
                'avatar' => $request->user()->avatar_url,
                'bio' => $request->user()->bio,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9_.]+$/', 'unique:users,username,'.$user->id],
            'bio' => 'nullable|string|max:160',
            'avatar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $data = $request->only('name', 'username', 'bio');

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }
            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return redirect()->route('profile.show', $user->username)->with('success', 'Profil berhasil diperbarui!');
    }
}
