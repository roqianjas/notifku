<?php

namespace App\Notifications;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class CommentRepliedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public User $replier,
        public Post $post,
        public Comment $reply,
        public Comment $parentComment
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'comment.replied',
            'message' => $this->replier->name.' membalas komentar kamu',
            'actor' => [
                'id' => $this->replier->id,
                'name' => $this->replier->name,
                'username' => $this->replier->username,
                'avatar' => $this->replier->avatar_url,
            ],
            'post_id' => $this->post->id,
            'comment_id' => $this->reply->id,
            'parent_comment_id' => $this->parentComment->id,
            'url' => '/post/'.$this->post->id,
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
