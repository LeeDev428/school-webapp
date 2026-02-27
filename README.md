# School Web App

A modern school web application built with **Laravel 12**, **React 19**, and **MySQL**. Features role-based access control, group-based post feeds, announcements, content moderation with keyword filtering, and user management.

---

## Tech Stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Backend     | Laravel 12 (PHP 8.2+)                         |
| Frontend    | React 19, TypeScript, Tailwind CSS v4         |
| UI Library  | shadcn/ui (new-york style, Radix primitives)  |
| Routing     | Inertia.js v2 (server-driven SPA)             |
| Auth        | Laravel Fortify (session-based)               |
| Build       | Vite 7                                        |
| Database    | MySQL                                         |
| Testing     | Pest                                          |
| Linting     | ESLint 9, Laravel Pint                        |

---

## Features

### Roles

| Role        | Capabilities                                                                 |
| ----------- | ---------------------------------------------------------------------------- |
| **Admin**   | Full access — user management, moderation, create announcements, all groups  |
| **Moderator** | Create posts/announcements in assigned groups, manage own group posts      |
| **Student** | View posts in assigned groups, create posts, comment, react                  |

### Core Functionality

- **USN-based Login** — No self-registration; admin creates all accounts
- **Dashboard** — Feed of posts from your groups with tabs (All, Announcements, My Groups, My Posts)
- **Create Post** — Select a group, write content, attach files, optionally mark as announcement
- **My Groups** — Grid view of subject groups with member count and last activity
- **Group View** — Full post feed within a specific group
- **Profile** — View profile info, update emergency contact and photo
- **User Management** (Admin) — Add/remove users, change roles, reset passwords, CSV bulk upload
- **Content Moderation** (Admin) — Keyword-based auto-flagging, manual flagging, approve/delete, manage keyword list

---

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+
- MySQL 8.0+

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd school-webapp

# Install PHP dependencies
composer install

# Install Node dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate app key
php artisan key:generate
```

### Database Setup

1. Create a MySQL database (e.g. `school_webapp`)
2. Update `.env` with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=school_webapp
DB_USERNAME=root
DB_PASSWORD=
```

3. Run migrations and seed:

```bash
php artisan migrate --seed
```

### Storage Link

```bash
php artisan storage:link
```

---

## Running the App

```bash
# Terminal 1 — Laravel backend
php artisan serve

# Terminal 2 — Vite dev server
npm run dev
```

Visit `http://localhost:8000`

---

## Default Accounts (from seeder)

| Role      | USN       | Password    |
| --------- | --------- | ----------- |
| Admin     | ADMIN001  | admin123    |
| Moderator | TCH001    | teacher123  |
| Student   | STU001    | student123  |
| Student   | STU002    | student123  |
| Student   | STU003    | student123  |

---

## Project Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── CommentController.php       # Comments & reactions
│   │   ├── DashboardController.php     # Main feed
│   │   ├── GroupController.php         # Group listing & detail
│   │   ├── ModerationController.php    # Content moderation (admin)
│   │   ├── PostController.php          # Create/delete posts
│   │   └── UserManagementController.php # User CRUD (admin)
│   └── Middleware/
│       └── EnsureUserHasRole.php       # Role-based route protection
├── Models/
│   ├── User.php
│   ├── Group.php
│   ├── Post.php
│   ├── PostAttachment.php
│   ├── Comment.php
│   ├── Reaction.php
│   └── FilteredKeyword.php
└── Providers/

resources/js/
├── pages/
│   ├── auth/login.tsx                  # USN-based login
│   ├── dashboard.tsx                   # Post feed with tabs
│   ├── posts/create.tsx                # Create post form
│   ├── groups/
│   │   ├── index.tsx                   # Group grid
│   │   └── show.tsx                    # Group post feed
│   ├── settings/profile.tsx            # Profile & emergency contact
│   ├── user-management/index.tsx       # Admin user table
│   └── moderation/index.tsx            # Admin moderation panel
├── components/                         # shadcn/ui + custom components
├── layouts/                            # App & settings layouts
└── types/                              # TypeScript type definitions

database/migrations/                    # Schema (users, groups, posts, etc.)
database/seeders/                       # Demo data with admin, teacher, students
```

---

## CSV Upload Format

For bulk student creation via User Management, use a CSV file with this format:

```csv
Name,Grade - Section,USN
Juan Dela Cruz,Grade 1 - Section A,STU100
Maria Santos,Grade 1 - Section A,STU101
```

- Default password is the student's USN
- Students are auto-assigned to groups matching their grade & section

---

## Content Moderation

The system supports two types of content flagging:

1. **System (Auto)** — Posts are checked against the keyword filter list on creation. Matching posts are automatically flagged.
2. **Manual** — Admins can manually flag any published post from the moderation panel.

Flagged posts are hidden from the feed until approved or deleted by an admin.

---

## Development Commands

```bash
# Run tests
php artisan test

# Lint PHP
./vendor/bin/pint

# Lint TypeScript
npx eslint .

# Build for production
npm run build

# Generate Wayfinder routes
php artisan wayfinder:generate
```

---

## License

This project is for educational purposes.
