<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('id');
            $table->string('usn')->unique()->after('name');
            $table->string('grade')->nullable()->after('usn');
            $table->string('section')->nullable()->after('grade');
            $table->string('profile_photo_path')->nullable()->after('section');
            $table->string('emergency_contact_relationship')->nullable()->after('profile_photo_path');
            $table->string('emergency_contact_email')->nullable()->after('emergency_contact_relationship');
            $table->string('emergency_contact_phone')->nullable()->after('emergency_contact_email');
            $table->string('email')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'usn',
                'grade',
                'section',
                'profile_photo_path',
                'emergency_contact_relationship',
                'emergency_contact_email',
                'emergency_contact_phone',
            ]);
            $table->string('email')->nullable(false)->change();
        });
    }
};
