<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\FollowNotification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FollowController extends Controller
{
    public function store(User $user, Request $request)
    {
        $currentUser = $request->user();

        if ($currentUser->id === $user->id) {
            return back();
        }

        if (! $currentUser->isFollowing($user)) {
            $currentUser->following()->attach($user->id);

            // Notify the followed user
            $user->notify(new FollowNotification($currentUser));
        }

        return back();
    }

    public function destroy(User $user, Request $request)
    {
        $request->user()->following()->detach($user->id);

        return back();
    }

    public function followers(User $user)
    {
        $followers = $user->followers()
            ->select('users.id', 'name', 'username', 'avatar')
            ->paginate(20);

        return Inertia::render('Profile/FollowList', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
            ],
            'users' => $followers,
            'type' => 'followers',
        ]);
    }

    public function following(User $user)
    {
        $following = $user->following()
            ->select('users.id', 'name', 'username', 'avatar')
            ->paginate(20);

        return Inertia::render('Profile/FollowList', [
            'profileUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
            ],
            'users' => $following,
            'type' => 'following',
        ]);
    }
}
