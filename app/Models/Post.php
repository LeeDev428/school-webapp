<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'group_id',
        'content',
        'is_announcement',
        'status',
        'flag_type',
    ];

    protected function casts(): array
    {
        return [
            'is_announcement' => 'boolean',
        ];
    }

    /**
     * Get the author of the post.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the group this post belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Get the attachments for this post.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(PostAttachment::class);
    }

    /**
     * Get the comments on this post.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the reactions on this post.
     */
    public function reactions(): HasMany
    {
        return $this->hasMany(Reaction::class);
    }

    /**
     * Check if a post is flagged.
     */
    public function isFlagged(): bool
    {
        return $this->status === 'flagged';
    }

    /**
     * Scope: only published or approved posts.
     */
    public function scopeVisible($query)
    {
        return $query->whereIn('status', ['published', 'approved']);
    }

    /**
     * Scope: only flagged posts.
     */
    public function scopeFlagged($query)
    {
        return $query->where('status', 'flagged');
    }

    /**
     * Scope: only announcements.
     */
    public function scopeAnnouncements($query)
    {
        return $query->where('is_announcement', true);
    }
}
