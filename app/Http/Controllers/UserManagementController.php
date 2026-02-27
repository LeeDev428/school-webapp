<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Show the user management page.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Filter by grade & section
        if ($request->filled('grade') && $request->filled('section')) {
            $query->where('grade', $request->grade)->where('section', $request->section);
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('usn', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('name')->paginate(10)->withQueryString();

        // Get unique grade-section combinations for filter dropdown
        $classes = User::whereNotNull('grade')
            ->whereNotNull('section')
            ->select('grade', 'section')
            ->distinct()
            ->orderBy('grade')
            ->orderBy('section')
            ->get();

        return Inertia::render('user-management/index', [
            'users' => $users,
            'classes' => $classes,
            'filters' => $request->only(['role', 'grade', 'section', 'search']),
        ]);
    }

    /**
     * Store a new user.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'usn' => ['required', 'string', 'max:255', 'unique:users,usn'],
            'role' => ['required', 'in:student,moderator,admin'],
            'password' => ['required', 'string', 'min:6'],
            'grade' => ['nullable', 'string', 'max:255'],
            'section' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'usn' => $request->usn,
            'role' => $request->role,
            'password' => $request->password,
            'grade' => $request->grade,
            'section' => $request->section,
        ]);

        // Auto-assign student to groups matching their grade & section
        if ($user->role === 'student' && $user->grade && $user->section) {
            $this->assignToGroups($user);
        }

        return back();
    }

    /**
     * Update a user's role.
     */
    public function updateRole(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'role' => ['required', 'in:student,moderator,admin'],
        ]);

        $user->update(['role' => $request->role]);

        return back();
    }

    /**
     * Reset a user's password.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user->update(['password' => $request->password]);

        return back();
    }

    /**
     * Remove a user.
     */
    public function destroy(User $user): RedirectResponse
    {
        $user->delete();

        return back();
    }

    /**
     * Upload a CSV list of students.
     */
    public function uploadList(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $file = $request->file('file');
        $handle = fopen($file->getPathname(), 'r');

        // Skip header row
        $header = fgetcsv($handle);

        $errors = [];
        $row = 1;

        while (($data = fgetcsv($handle)) !== false) {
            $row++;

            if (count($data) < 3) {
                $errors[] = "Row {$row}: insufficient columns.";
                continue;
            }

            [$name, $gradeSection, $usn] = $data;

            // Parse "Grade X - Section Y" format
            $parts = array_map('trim', explode('-', $gradeSection, 2));
            $grade = $parts[0] ?? null;
            $section = $parts[1] ?? null;

            // Skip if USN already exists
            if (User::where('usn', $usn)->exists()) {
                $errors[] = "Row {$row}: USN '{$usn}' already exists.";
                continue;
            }

            $user = User::create([
                'name' => trim($name),
                'usn' => trim($usn),
                'role' => 'student',
                'password' => trim($usn), // Default password is USN
                'grade' => $grade,
                'section' => $section,
            ]);

            // Auto-assign to matching groups
            $this->assignToGroups($user);
        }

        fclose($handle);

        if (! empty($errors)) {
            return back()->with('upload_errors', $errors);
        }

        return back();
    }

    /**
     * Assign a student to all groups matching their grade & section.
     */
    private function assignToGroups(User $user): void
    {
        $groups = Group::where('grade', $user->grade)
            ->where('section', $user->section)
            ->get();

        $user->groups()->syncWithoutDetaching($groups->pluck('id'));
    }
}
