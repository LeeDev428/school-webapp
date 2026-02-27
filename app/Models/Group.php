<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'grade',
        'section',
        'moderator_id',
    ];

    /**
     * Get the moderator (teacher) assigned to this group.
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_id');
    }

    /**
     * Get the members (students) of this group.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withTimestamps();
    }

    /**
     * Get all posts in this group.
     */
    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    /**
     * Get total member count including moderator.
     */
    public function getTotalMembersAttribute(): int
    {
        return $this->members()->count() + ($this->moderator_id ? 1 : 0);
    }

    /**
     * Get the latest post in this group.
     */
    public function latestPost(): HasMany
    {
        return $this->hasMany(Post::class)->latestOfMany();
    }
}
