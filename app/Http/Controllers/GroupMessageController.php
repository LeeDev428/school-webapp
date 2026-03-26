<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupMessage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class GroupMessageController extends Controller
{
    /**
     * Store a new group chat message.
     */
    public function store(Request $request, Group $group): RedirectResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        // Ensure the user can access this group.
        if (! $user->isAdmin()) {
            $isMember = $group->members()->where('user_id', $user->id)->exists();
            $isModerator = $group->moderator_id === $user->id;

            if (! $isMember && ! $isModerator) {
                abort(403);
            }
        }

        GroupMessage::create([
            'group_id' => $group->id,
            'user_id' => $user->id,
            'message' => $request->message,
        ]);

        return back();
    }
}
