<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class FollowNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $follower
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'user.follow',
            'message' => $this->follower->name.' mulai mengikuti kamu',
            'actor' => [
                'id' => $this->follower->id,
                'name' => $this->follower->name,
                'username' => $this->follower->username,
                'avatar' => $this->follower->avatar_url,
            ],
            'url' => '/profile/'.$this->follower->username,
        ];
    }

    public function toBroadcast(object $notifiable)
    {
        return new \Illuminate\Notifications\Messages\BroadcastMessage(
            $this->toArray($notifiable)
        );
    }
}
