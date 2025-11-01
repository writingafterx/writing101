# Learning Management System (LMS)

A comprehensive Learning Management System built with Node.js, Express, React, and SQLite. This system provides a complete platform for managing courses, students, assignments, discussions, and grading.

## Features

### User Management
- **Three user roles**: Admin, Instructor, and Student
- User authentication with JWT tokens
- Profile management
- User registration and login

### Course Management
- Create and manage courses
- Course enrollment system
- Syllabus management
- Course details including semester, year, credits, and dates
- View enrolled students and their grades

### Assignment Management
- Create and publish assignments
- Set due dates and point values
- Allow/disallow late submissions
- Student submission portal
- Instructor grading interface with feedback
- Track submission status (submitted, late, graded)

### Discussion Forums
- Create course-specific discussions
- Reply to discussions
- Pin important discussions (instructor only)
- Lock discussions to prevent replies (instructor only)
- View discussion history and participants

### Grading System
- Grade assignments with points and written feedback
- Track student grades across courses
- Final grades and letter grades for courses
- Grade history and statistics

### Dashboard
- Personalized dashboard for each user role
- Quick access to courses and assignments
- Upcoming assignments display for students
- Statistics and overview

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Sequelize** - ORM for database management
- **SQLite** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Axios** - HTTP client
- **CSS3** - Styling

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd writing101
   ```

2. **Install backend dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   cd ..
   ```

4. **Environment Configuration**
   - Copy `.env.example` to `.env`
   ```bash
   cp .env.example .env
   ```
   - Update the `.env` file with your configuration:
     - `PORT`: Server port (default: 5000)
     - `JWT_SECRET`: Secret key for JWT tokens (change in production!)
     - `NODE_ENV`: Environment (development/production)
     - `DB_PATH`: Path to SQLite database file

5. **Database Setup**

   The database will be automatically created when you start the server. For a quick start with sample data:

   ```bash
   npm run seed
   ```

   This creates sample users, courses, assignments, and discussions.

   **Sample Login Credentials:**
   - Admin: `admin@lms.com` / `admin123`
   - Instructor: `john.smith@lms.com` / `instructor123`
   - Student: `alice.brown@student.lms.com` / `student123`

   See [DATABASE.md](DATABASE.md) for detailed database documentation.

6. **Start the development servers**

   **Option 1: Run both servers separately**

   Terminal 1 - Backend:
   ```bash
   npm run dev
   ```

   Terminal 2 - Frontend:
   ```bash
   npm run client
   ```

   **Option 2: Production build**
   ```bash
   cd client
   npm run build
   cd ..
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (admin/instructor)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user (admin)

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course (admin)
- `POST /api/courses/:id/enroll` - Enroll in course
- `POST /api/courses/:id/drop` - Drop course

### Assignments
- `GET /api/assignments/course/:courseId` - Get course assignments
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments` - Create assignment (instructor/admin)
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment
- `POST /api/assignments/:id/submit` - Submit assignment (student)
- `POST /api/assignments/submissions/:submissionId/grade` - Grade submission

### Discussions
- `GET /api/discussions/course/:courseId` - Get course discussions
- `GET /api/discussions/:id` - Get discussion details
- `POST /api/discussions` - Create discussion
- `PUT /api/discussions/:id` - Update discussion
- `DELETE /api/discussions/:id` - Delete discussion
- `POST /api/discussions/:id/replies` - Add reply
- `POST /api/discussions/:id/pin` - Pin/unpin discussion
- `POST /api/discussions/:id/lock` - Lock/unlock discussion

## User Roles and Permissions

### Admin
- Full access to all features
- Manage users, courses, assignments
- View all students and instructors
- Delete courses and users

### Instructor
- Create and manage their own courses
- Create and grade assignments
- View enrolled students
- Manage discussions (pin/lock)
- Enroll students in courses

### Student
- Enroll in courses
- View course materials and syllabus
- Submit assignments
- Participate in discussions
- View grades and feedback

## Database Schema

The system uses the following main models:

- **User** - Stores user information (students, instructors, admins)
- **Course** - Course information and settings
- **Assignment** - Assignment details and settings
- **Submission** - Student assignment submissions
- **Discussion** - Discussion forum threads
- **DiscussionReply** - Replies to discussions
- **Enrollment** - Student-course enrollments with grades

## Default Users

After starting the server, you can register users with any of these roles:
- `admin` - Full system access
- `instructor` - Can create and manage courses
- `student` - Can enroll and participate in courses

## Development

### Project Structure
```
writing101/
├── server/                # Backend code
│   ├── config/           # Database configuration
│   ├── models/           # Sequelize models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   └── index.js          # Server entry point
├── client/               # Frontend React app
│   ├── public/          # Static files
│   └── src/
│       ├── components/  # React components
│       ├── services/    # API service layer
│       ├── App.js       # Main app component
│       └── index.js     # React entry point
├── package.json         # Backend dependencies
└── README.md           # This file
```

### Adding New Features

1. **Backend**: Add models in `server/models/`, routes in `server/routes/`
2. **Frontend**: Add components in `client/src/components/`, update routes in `App.js`
3. **Database**: Models will auto-sync on server start in development mode

## Troubleshooting

### Database Issues
- Delete `database.sqlite` and restart the server to reset the database
- Check `.env` file for correct `DB_PATH`

### Port Conflicts
- Change `PORT` in `.env` file if port 5000 is in use
- Update proxy in `client/package.json` if backend port changes

### Authentication Issues
- Clear browser localStorage and cookies
- Check JWT_SECRET in `.env` file
- Verify token is being sent in Authorization header

## Security Notes

**Important for Production:**
1. Change `JWT_SECRET` in `.env` to a strong random string
2. Use HTTPS in production
3. Set `NODE_ENV=production`
4. Use a production database (PostgreSQL/MySQL) instead of SQLite
5. Implement rate limiting
6. Add input validation and sanitization
7. Set up CORS properly for your domain

## Future Enhancements

Potential features to add:
- File upload for assignments
- Email notifications
- Calendar view for assignments
- Grade analytics and reports
- Course announcements
- Quiz/test functionality
- Attendance tracking
- Video conferencing integration
- Mobile app
- Real-time chat

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues, questions, or contributions, please open an issue in the repository.

## Acknowledgments

Built with modern web technologies to provide a comprehensive learning management experience for educational institutions.
