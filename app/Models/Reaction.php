<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reaction extends Model
{
    protected $fillable = [
        'post_id',
        'user_id',
        'type',
    ];

    /**
     * Get the post this reaction belongs to.
     */
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user who reacted.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
