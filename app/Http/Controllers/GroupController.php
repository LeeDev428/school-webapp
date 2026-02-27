<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GroupController extends Controller
{
    /**
     * Show the user's groups.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $groups = $user->allGroups();

        // Load member counts and latest post for each group
        $groups->loadCount('members');
        $groups->load(['moderator:id,name', 'posts' => fn ($q) => $q->latest()->limit(1)]);

        return Inertia::render('groups/index', [
            'groups' => $groups,
        ]);
    }

    /**
     * Show a specific group with its posts.
     */
    public function show(Request $request, Group $group): Response
    {
        $user = $request->user();

        // Verify user has access to this group
        if (! $user->isAdmin()) {
            $isMember = $group->members()->where('user_id', $user->id)->exists();
            $isModerator = $group->moderator_id === $user->id;

            if (! $isMember && ! $isModerator) {
                abort(403);
            }
        }

        $group->loadCount('members');
        $group->load('moderator:id,name');

        $posts = Post::with([
            'user:id,name,role,grade,section,profile_photo_path',
            'comments.user:id,name,profile_photo_path',
            'reactions',
            'attachments',
        ])
            ->where('group_id', $group->id)
            ->visible()
            ->latest()
            ->paginate(15);

        return Inertia::render('groups/show', [
            'group' => $group,
            'posts' => $posts,
        ]);
    }
}
