<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostCommentedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $commenter,
        public Post $post,
        public Comment $comment
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'post.commented',
            'message' => $this->commenter->name.' mengomentari postingan kamu',
            'actor' => [
                'id' => $this->commenter->id,
                'name' => $this->commenter->name,
                'username' => $this->commenter->username,
                'avatar' => $this->commenter->avatar_url,
            ],
            'post_id' => $this->post->id,
            'comment_id' => $this->comment->id,
            'url' => '/post/'.$this->post->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
