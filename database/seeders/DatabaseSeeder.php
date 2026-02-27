<?php

namespace Database\Seeders;

use App\Models\Group;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Default subjects for K-12 Philippine curriculum.
     */
    private array $subjects = [
        'Mother Tongue',
        'Filipino',
        'English',
        'Mathematics',
        'Araling Panlipunan',
        'Edukasyon sa Pagpapakatao',
        'Music',
        'Arts',
        'Physical Education',
    ];

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin account (default system admin)
        $admin = User::create([
            'name' => 'System Admin',
            'usn' => 'ADMIN001',
            'email' => 'admin@gmail.com',
            'role' => 'admin',
            'password' => 'password',
        ]);

        // Create sample moderator (teacher)
        $teacher = User::create([
            'name' => 'Maria Santos',
            'usn' => 'TCH001',
            'email' => 'maria.santos@gmail.com',
            'role' => 'moderator',
            'password' => 'password',
        ]);

        // Create sample groups for Grade 1 - Section A
        $grade = 'Grade 1';
        $section = 'Section A';

        foreach ($this->subjects as $subject) {
            Group::create([
                'name' => $subject,
                'grade' => $grade,
                'section' => $section,
                'moderator_id' => $teacher->id,
            ]);
        }

        // Create sample students
        $students = [
            ['name' => 'Juan Dela Cruz', 'usn' => 'STD001'],
            ['name' => 'Ana Reyes', 'usn' => 'STD002'],
            ['name' => 'Carlos Garcia', 'usn' => 'STD003'],
        ];

        $groups = Group::where('grade', $grade)->where('section', $section)->get();

        foreach ($students as $studentData) {
            $student = User::create([
                ...$studentData,
                'role' => 'student',
                'password' => $studentData['usn'],
                'grade' => $grade,
                'section' => $section,
            ]);

            // Assign to all groups in their grade-section
            $student->groups()->attach($groups->pluck('id'));
        }
    }
}
