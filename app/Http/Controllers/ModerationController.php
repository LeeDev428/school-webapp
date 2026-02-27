<?php

namespace App\Http\Controllers;

use App\Models\FilteredKeyword;
use App\Models\Post;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ModerationController extends Controller
{
    /**
     * Show the moderation page.
     */
    public function index(Request $request): Response
    {
        $tab = $request->get('tab', 'all');

        $postsQuery = Post::with([
            'user:id,name,role,grade,section,profile_photo_path',
            'group:id,name',
        ])->latest();

        $posts = match ($tab) {
            'system' => $postsQuery->where('status', 'flagged')->where('flag_type', 'system')->paginate(10),
            'manual' => $postsQuery->where('status', 'flagged')->where('flag_type', 'manual')->paginate(10),
            default => $postsQuery->paginate(10),
        };

        $keywords = FilteredKeyword::with('creator:id,name')->latest()->get();

        return Inertia::render('moderation/index', [
            'posts' => $posts,
            'keywords' => $keywords,
            'activeTab' => $tab,
        ]);
    }

    /**
     * Approve a flagged post.
     */
    public function approve(Post $post): RedirectResponse
    {
        $post->update([
            'status' => 'approved',
            'flag_type' => null,
        ]);

        return back();
    }

    /**
     * Delete a flagged post.
     */
    public function delete(Post $post): RedirectResponse
    {
        $post->update(['status' => 'deleted']);

        return back();
    }

    /**
     * Flag a post manually.
     */
    public function flag(Post $post): RedirectResponse
    {
        $post->update([
            'status' => 'flagged',
            'flag_type' => 'manual',
        ]);

        return back();
    }

    /**
     * Add a keyword to the filter list.
     */
    public function addKeyword(Request $request): RedirectResponse
    {
        $request->validate([
            'keyword' => ['required', 'string', 'max:100', 'unique:filtered_keywords,keyword'],
        ]);

        FilteredKeyword::create([
            'keyword' => strtolower($request->keyword),
            'created_by' => $request->user()->id,
        ]);

        return back();
    }

    /**
     * Remove a keyword from the filter list.
     */
    public function removeKeyword(FilteredKeyword $keyword): RedirectResponse
    {
        $keyword->delete();

        return back();
    }
}
