<?php

namespace App\Notifications;

use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $liker,
        public Post $post
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'post.liked',
            'message' => $this->liker->name.' menyukai postingan kamu',
            'actor' => [
                'id' => $this->liker->id,
                'name' => $this->liker->name,
                'username' => $this->liker->username,
                'avatar' => $this->liker->avatar_url,
            ],
            'post_id' => $this->post->id,
            'url' => '/post/'.$this->post->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
