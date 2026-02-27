<?php

namespace App\Http\Controllers;

use App\Models\FilteredKeyword;
use App\Models\Post;
use App\Models\PostAttachment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    /**
     * Show the create post form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();
        $groups = $user->allGroups();

        return Inertia::render('posts/create', [
            'groups' => $groups,
        ]);
    }

    /**
     * Store a new post.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'group_id' => ['required', 'exists:groups,id'],
            'is_announcement' => ['boolean'],
            'attachments.*' => ['file', 'max:10240'],
        ]);

        $user = $request->user();

        // Students cannot create announcements
        $isAnnouncement = $user->isStudent() ? false : $request->boolean('is_announcement');

        // Check content against filtered keywords
        $status = 'published';
        $flagType = null;
        $keywords = FilteredKeyword::pluck('keyword')->toArray();
        $contentLower = strtolower($request->content);

        foreach ($keywords as $keyword) {
            if (str_contains($contentLower, strtolower($keyword))) {
                $status = 'flagged';
                $flagType = 'system';
                break;
            }
        }

        $post = Post::create([
            'user_id' => $user->id,
            'group_id' => $request->group_id,
            'content' => $request->content,
            'is_announcement' => $isAnnouncement,
            'status' => $status,
            'flag_type' => $flagType,
        ]);

        // Handle file attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('post-attachments', 'public');

                PostAttachment::create([
                    'post_id' => $post->id,
                    'file_path' => $path,
                    'file_type' => $file->getMimeType(),
                    'original_name' => $file->getClientOriginalName(),
                ]);
            }
        }

        return to_route('dashboard');
    }

    /**
     * Delete a post.
     */
    public function destroy(Request $request, Post $post): RedirectResponse
    {
        $user = $request->user();

        // Only post author or admin can delete
        if ($post->user_id !== $user->id && ! $user->isAdmin()) {
            abort(403);
        }

        // Delete attachments from storage
        foreach ($post->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $post->delete();

        return back();
    }
}
