<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\ModerationController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Posts
    Route::get('posts/create', [PostController::class, 'create'])->name('posts.create');
    Route::post('posts', [PostController::class, 'store'])->name('posts.store');
    Route::delete('posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    // Comments & Reactions
    Route::post('posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::post('posts/{post}/react', [CommentController::class, 'toggleReaction'])->name('reactions.toggle');

    // Groups
    Route::get('groups', [GroupController::class, 'index'])->name('groups.index');
    Route::get('groups/{group}', [GroupController::class, 'show'])->name('groups.show');

    // Profile (handled in settings.php)
});

// Admin-only routes
Route::middleware(['auth', 'role:admin'])->group(function () {
    // User Management
    Route::get('user-management', [UserManagementController::class, 'index'])->name('user-management.index');
    Route::post('user-management', [UserManagementController::class, 'store'])->name('user-management.store');
    Route::patch('user-management/{user}/role', [UserManagementController::class, 'updateRole'])->name('user-management.update-role');
    Route::patch('user-management/{user}/password', [UserManagementController::class, 'resetPassword'])->name('user-management.reset-password');
    Route::delete('user-management/{user}', [UserManagementController::class, 'destroy'])->name('user-management.destroy');
    Route::post('user-management/upload', [UserManagementController::class, 'uploadList'])->name('user-management.upload');

    // Keyword management (admin only)
    Route::post('moderation/keywords', [ModerationController::class, 'addKeyword'])->name('moderation.add-keyword');
    Route::delete('moderation/keywords/{keyword}', [ModerationController::class, 'removeKeyword'])->name('moderation.remove-keyword');
});

// Admin and Moderator routes
Route::middleware(['auth', 'role:admin,moderator'])->group(function () {
    Route::get('moderation', [ModerationController::class, 'index'])->name('moderation.index');
    Route::post('moderation/{post}/approve', [ModerationController::class, 'approve'])->name('moderation.approve');
    Route::post('moderation/{post}/delete', [ModerationController::class, 'delete'])->name('moderation.delete');
    Route::post('moderation/{post}/flag', [ModerationController::class, 'flag'])->name('moderation.flag');
});

require __DIR__.'/settings.php';
