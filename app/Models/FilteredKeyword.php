<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FilteredKeyword extends Model
{
    protected $fillable = [
        'keyword',
        'created_by',
    ];

    /**
     * Get the admin who created this keyword.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
