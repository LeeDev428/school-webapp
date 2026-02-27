<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Store a new comment on a post.
     */
    public function store(Request $request, Post $post): RedirectResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        Comment::create([
            'post_id' => $post->id,
            'user_id' => $request->user()->id,
            'content' => $request->content,
        ]);

        return back();
    }

    /**
     * Toggle a reaction on a post.
     */
    public function toggleReaction(Request $request, Post $post): RedirectResponse
    {
        $existing = Reaction::where('post_id', $post->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            Reaction::create([
                'post_id' => $post->id,
                'user_id' => $request->user()->id,
                'type' => 'like',
            ]);
        }

        return back();
    }
}
