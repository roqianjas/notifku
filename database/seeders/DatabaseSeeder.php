<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create demo users
        $alice = User::create([
            'name' => 'Alice Wonderland',
            'username' => 'alice',
            'email' => 'alice@notifku.com',
            'password' => Hash::make('password'),
            'bio' => 'Exploring the digital wonderland ✨',
        ]);

        $bob = User::create([
            'name' => 'Bob Builder',
            'username' => 'bob',
            'email' => 'bob@notifku.com',
            'password' => Hash::make('password'),
            'bio' => 'Building cool things 🔨',
        ]);

        $charlie = User::create([
            'name' => 'Charlie Brown',
            'username' => 'charlie',
            'email' => 'charlie@notifku.com',
            'password' => Hash::make('password'),
            'bio' => 'Good grief! 🐶',
        ]);

        $diana = User::create([
            'name' => 'Diana Prince',
            'username' => 'diana',
            'email' => 'diana@notifku.com',
            'password' => Hash::make('password'),
            'bio' => 'Wonder Woman IRL 🦸‍♀️',
        ]);

        // Follow relationships
        $alice->following()->attach([$bob->id, $charlie->id, $diana->id]);
        $bob->following()->attach([$alice->id, $diana->id]);
        $charlie->following()->attach([$alice->id, $bob->id]);
        $diana->following()->attach([$alice->id]);

        // Create posts
        $alice->posts()->create(['body' => 'Halo semua! Ini post pertama di NotifKu 🎉']);
        $alice->posts()->create(['body' => 'Hari ini cuaca cerah, cocok untuk coding ☀️💻']);

        $bob->posts()->create(['body' => 'Baru selesai membangun fitur baru. Semangat terus! 💪']);
        $bob->posts()->create(['body' => 'Siapa yang suka ngopi sambil ngoding? ☕']);

        $charlie->posts()->create(['body' => 'Good morning everyone! Have a productive day 🌅']);

        $diana->posts()->create(['body' => 'Platform ini keren banget, notifikasinya real-time! 🔔']);

        // Add some likes
        $post1 = $alice->posts()->first();
        $post1->likes()->create(['user_id' => $bob->id]);
        $post1->likes()->create(['user_id' => $charlie->id]);
        $post1->likes()->create(['user_id' => $diana->id]);

        $bobPost = $bob->posts()->first();
        $bobPost->likes()->create(['user_id' => $alice->id]);

        // Add some comments
        $comment = $post1->comments()->create([
            'user_id' => $bob->id,
            'body' => 'Welcome to the platform, Alice! 👋',
        ]);

        // Reply to comment
        $post1->comments()->create([
            'user_id' => $alice->id,
            'parent_id' => $comment->id,
            'body' => 'Terima kasih Bob! Senang bergabung 😊',
        ]);

        $post1->comments()->create([
            'user_id' => $charlie->id,
            'body' => 'Platform ini seru banget!',
        ]);
    }
}
