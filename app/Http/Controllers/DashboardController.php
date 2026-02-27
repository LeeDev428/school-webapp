<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the dashboard with posts and announcements.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $groupIds = $user->allGroups()->pluck('id');

        $posts = Post::with(['user:id,name,role,grade,section,profile_photo_path', 'group:id,name', 'comments.user:id,name,profile_photo_path', 'reactions'])
            ->visible()
            ->where(function ($query) use ($groupIds) {
                $query->whereIn('group_id', $groupIds)
                    ->orWhere('is_announcement', true);
            })
            ->latest()
            ->paginate(10);

        $announcements = Post::with(['user:id,name,role'])
            ->visible()
            ->announcements()
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('dashboard', [
            'posts' => $posts,
            'announcements' => $announcements,
        ]);
    }
}
