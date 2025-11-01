# Database Setup Guide

## Database Technology

This LMS uses **SQLite** as the database. SQLite is a lightweight, file-based database that requires no separate server installation.

## Database Location

The database file is stored at: `./database.sqlite` (in the project root directory)

## Database Setup

### Automatic Setup (When Starting Server)

When you run the server for the first time, the database will be **automatically created** with all necessary tables:

```bash
npm run dev
```

The server will:
1. Connect to SQLite
2. Create all tables based on the models (if they don't exist)
3. Synchronize the schema with your models

You'll see output like:
```
Database connection established successfully.
Database synchronized.
LMS Server running on port 5000
```

### Database Models/Tables

The following tables will be created automatically:

1. **Users** - Stores all users (admin, instructors, students)
   - id, email, password (hashed), firstName, lastName, role, avatar, isActive

2. **Courses** - Course information
   - id, code, title, description, syllabus, semester, year, credits, dates, instructorId

3. **Assignments** - Assignment details
   - id, courseId, title, description, instructions, dueDate, maxPoints, settings

4. **Submissions** - Student assignment submissions
   - id, assignmentId, studentId, content, attachmentUrl, grade, feedback, status

5. **Discussions** - Discussion forum threads
   - id, courseId, authorId, title, content, isPinned, isLocked

6. **DiscussionReplies** - Replies to discussions
   - id, discussionId, authorId, content

7. **Enrollments** - Student-course relationships
   - id, studentId, courseId, enrollmentDate, status, finalGrade, letterGrade

## Seeding the Database with Sample Data

To get started quickly with sample data, run the seed script:

```bash
npm run seed
```

This will create:
- **1 Admin account**
- **2 Instructor accounts**
- **5 Student accounts**
- **3 Sample courses** (CS101, MATH201, ENG102)
- **4 Sample assignments**
- **Student enrollments**
- **Sample discussions**

### Sample Login Credentials (After Seeding)

**Admin:**
- Email: `admin@lms.com`
- Password: `admin123`

**Instructors:**
- Email: `john.smith@lms.com` | Password: `instructor123`
- Email: `sarah.johnson@lms.com` | Password: `instructor123`

**Students:**
- Email: `alice.brown@student.lms.com` | Password: `student123`
- Email: `bob.wilson@student.lms.com` | Password: `student123`
- Email: `carol.davis@student.lms.com` | Password: `student123`
- Email: `david.miller@student.lms.com` | Password: `student123`
- Email: `emma.garcia@student.lms.com` | Password: `student123`

## Resetting the Database

To completely reset the database (delete all data and recreate with seed data):

```bash
npm run db:reset
```

**WARNING:** This will delete ALL existing data!

## Manual Database Management

### Using SQLite Command Line

If you have SQLite installed, you can query the database directly:

```bash
sqlite3 database.sqlite
```

Common commands:
```sql
-- List all tables
.tables

-- View table structure
.schema Users

-- Query data
SELECT * FROM Users;
SELECT * FROM Courses;

-- Exit
.quit
```

### Using a GUI Tool

You can use database management tools to view and edit the database:

- **DB Browser for SQLite** (Free): https://sqlitebrowser.org/
- **DBeaver** (Free): https://dbeaver.io/
- **TablePlus**: https://tableplus.com/

Open the `database.sqlite` file in any of these tools to browse and edit data.

## Database in Production

For production use, consider:

1. **Migrating to PostgreSQL or MySQL** for better performance and concurrent access
2. **Backing up the database file regularly** (in development with SQLite)
3. **Using database migrations** for schema changes (Sequelize migrations)
4. **Setting up proper database credentials** and connection pooling

### Switching to PostgreSQL (Example)

Update `server/config/database.js`:

```javascript
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);
```

And update `.env`:
```
DB_NAME=lms_database
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
```

## Database Relationships

### One-to-Many
- User (Instructor) → Courses (teaches many)
- Course → Assignments (has many)
- Assignment → Submissions (has many)
- Discussion → DiscussionReplies (has many)

### Many-to-Many
- Students ↔ Courses (through Enrollments table)

### Entity Relationship Diagram

```
Users
  ├─→ Courses (as instructor)
  ├─→ Submissions (as student)
  ├─→ Discussions (as author)
  ├─→ DiscussionReplies (as author)
  └─→ Enrollments (as student)

Courses
  ├─→ Assignments
  ├─→ Discussions
  └─→ Enrollments

Assignments
  └─→ Submissions

Discussions
  └─→ DiscussionReplies
```

## Troubleshooting

### Database locked error
SQLite can only handle one write operation at a time. If you get a "database is locked" error:
- Ensure no other processes are accessing the database
- Consider using a production database like PostgreSQL

### Tables not created
- Check the server logs for errors
- Verify your `.env` file has correct `DB_PATH`
- Try deleting `database.sqlite` and restarting

### Migration errors
- Use `{ alter: true }` in development: `sequelize.sync({ alter: true })`
- For production, use Sequelize migrations

### Connection errors
- Verify the `database.sqlite` file has proper read/write permissions
- Check that the directory exists

## Database Maintenance

### Backup the Database

```bash
# Copy the database file
cp database.sqlite database.backup.sqlite

# Or with timestamp
cp database.sqlite "database.backup.$(date +%Y%m%d_%H%M%S).sqlite"
```

### View Database Size

```bash
ls -lh database.sqlite
```

### Optimize Database (Vacuum)

```bash
sqlite3 database.sqlite "VACUUM;"
```

## Schema Changes

When you modify models in `server/models/`, the database will automatically update on server restart (in development with `alter: true`).

For production, use Sequelize migrations:

```bash
# Install Sequelize CLI
npm install --save-dev sequelize-cli

# Create a migration
npx sequelize-cli migration:generate --name add-new-field

# Run migrations
npx sequelize-cli db:migrate
```

## Environment Variables

Database-related environment variables in `.env`:

```
DB_PATH=./database.sqlite
NODE_ENV=development
```

For production databases:
```
DB_NAME=lms_prod
DB_USER=lms_user
DB_PASSWORD=secure_password
DB_HOST=your-db-host.com
DB_PORT=5432
```
