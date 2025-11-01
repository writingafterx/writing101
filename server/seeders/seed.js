const { sequelize, User, Course, Assignment, Discussion, Enrollment } = require('../models');

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Sync database (creates tables)
    await sequelize.sync({ force: true }); // WARNING: This will drop existing tables
    console.log('Database synchronized.');

    // Create users
    const admin = await User.create({
      email: 'admin@lms.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    const instructor1 = await User.create({
      email: 'john.smith@lms.com',
      password: 'instructor123',
      firstName: 'John',
      lastName: 'Smith',
      role: 'instructor'
    });

    const instructor2 = await User.create({
      email: 'sarah.johnson@lms.com',
      password: 'instructor123',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: 'instructor'
    });

    const students = await Promise.all([
      User.create({
        email: 'alice.brown@student.lms.com',
        password: 'student123',
        firstName: 'Alice',
        lastName: 'Brown',
        role: 'student'
      }),
      User.create({
        email: 'bob.wilson@student.lms.com',
        password: 'student123',
        firstName: 'Bob',
        lastName: 'Wilson',
        role: 'student'
      }),
      User.create({
        email: 'carol.davis@student.lms.com',
        password: 'student123',
        firstName: 'Carol',
        lastName: 'Davis',
        role: 'student'
      }),
      User.create({
        email: 'david.miller@student.lms.com',
        password: 'student123',
        firstName: 'David',
        lastName: 'Miller',
        role: 'student'
      }),
      User.create({
        email: 'emma.garcia@student.lms.com',
        password: 'student123',
        firstName: 'Emma',
        lastName: 'Garcia',
        role: 'student'
      })
    ]);

    console.log('Users created.');

    // Create courses
    const course1 = await Course.create({
      code: 'CS101',
      title: 'Introduction to Computer Science',
      description: 'Learn the fundamentals of computer science and programming.',
      syllabus: `Week 1: Introduction to Programming
Week 2: Variables and Data Types
Week 3: Control Flow
Week 4: Functions and Methods
Week 5: Data Structures
Week 6: Algorithms
Week 7: Object-Oriented Programming
Week 8: File I/O
Week 9: Exception Handling
Week 10: Final Project`,
      semester: 'Fall',
      year: 2024,
      credits: 3,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      instructorId: instructor1.id
    });

    const course2 = await Course.create({
      code: 'MATH201',
      title: 'Calculus I',
      description: 'Introduction to differential and integral calculus.',
      syllabus: `Week 1: Limits and Continuity
Week 2: Derivatives
Week 3: Rules of Differentiation
Week 4: Applications of Derivatives
Week 5: Optimization Problems
Week 6: Integration
Week 7: Fundamental Theorem of Calculus
Week 8: Applications of Integration
Week 9: Techniques of Integration
Week 10: Final Exam`,
      semester: 'Fall',
      year: 2024,
      credits: 4,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      instructorId: instructor2.id
    });

    const course3 = await Course.create({
      code: 'ENG102',
      title: 'English Composition',
      description: 'Develop your writing and critical thinking skills.',
      syllabus: `Week 1: Introduction to Academic Writing
Week 2: Thesis Statements
Week 3: Research Methods
Week 4: Argumentative Essays
Week 5: Peer Review Workshop
Week 6: Rhetorical Analysis
Week 7: Literary Analysis
Week 8: Research Paper
Week 9: Presentations
Week 10: Final Portfolio`,
      semester: 'Fall',
      year: 2024,
      credits: 3,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-15'),
      instructorId: instructor1.id
    });

    console.log('Courses created.');

    // Enroll students in courses
    await Promise.all([
      // Enroll all students in CS101
      Enrollment.create({ studentId: students[0].id, courseId: course1.id }),
      Enrollment.create({ studentId: students[1].id, courseId: course1.id }),
      Enrollment.create({ studentId: students[2].id, courseId: course1.id }),
      Enrollment.create({ studentId: students[3].id, courseId: course1.id }),

      // Enroll some students in MATH201
      Enrollment.create({ studentId: students[0].id, courseId: course2.id }),
      Enrollment.create({ studentId: students[1].id, courseId: course2.id }),
      Enrollment.create({ studentId: students[4].id, courseId: course2.id }),

      // Enroll some students in ENG102
      Enrollment.create({ studentId: students[2].id, courseId: course3.id }),
      Enrollment.create({ studentId: students[3].id, courseId: course3.id }),
      Enrollment.create({ studentId: students[4].id, courseId: course3.id })
    ]);

    console.log('Students enrolled in courses.');

    // Create assignments
    const assignment1 = await Assignment.create({
      courseId: course1.id,
      title: 'Hello World Program',
      description: 'Write your first program that prints "Hello, World!" to the console.',
      instructions: 'Create a new file and write a program in your chosen language that outputs "Hello, World!". Submit your code file.',
      dueDate: new Date('2024-09-15'),
      maxPoints: 100,
      allowLateSubmission: true,
      isPublished: true
    });

    const assignment2 = await Assignment.create({
      courseId: course1.id,
      title: 'Variables and Data Types Assignment',
      description: 'Practice working with different data types and variables.',
      instructions: 'Complete the exercises in the workbook on variables, integers, floats, strings, and booleans.',
      dueDate: new Date('2024-09-22'),
      maxPoints: 100,
      allowLateSubmission: true,
      isPublished: true
    });

    const assignment3 = await Assignment.create({
      courseId: course2.id,
      title: 'Limits Problem Set',
      description: 'Solve problems related to limits and continuity.',
      instructions: 'Complete problems 1-20 from Chapter 2 of the textbook. Show all your work.',
      dueDate: new Date('2024-09-18'),
      maxPoints: 100,
      allowLateSubmission: false,
      isPublished: true
    });

    const assignment4 = await Assignment.create({
      courseId: course3.id,
      title: 'Argumentative Essay',
      description: 'Write a 5-page argumentative essay on a topic of your choice.',
      instructions: `Write a well-structured argumentative essay:
- 5 pages minimum
- MLA format
- At least 5 credible sources
- Clear thesis statement
- Strong supporting arguments
- Proper citations`,
      dueDate: new Date('2024-10-01'),
      maxPoints: 200,
      allowLateSubmission: true,
      isPublished: true
    });

    console.log('Assignments created.');

    // Create discussions
    await Discussion.create({
      courseId: course1.id,
      authorId: instructor1.id,
      title: 'Welcome to CS101!',
      content: 'Welcome everyone! Please introduce yourself and tell us why you\'re interested in computer science.',
      isPinned: true
    });

    await Discussion.create({
      courseId: course1.id,
      authorId: students[0].id,
      title: 'Question about Variables',
      content: 'Can someone explain the difference between local and global variables?'
    });

    await Discussion.create({
      courseId: course2.id,
      authorId: instructor2.id,
      title: 'Course Guidelines',
      content: 'Please read the syllabus carefully. All assignments must be submitted on time unless you have prior approval.',
      isPinned: true
    });

    await Discussion.create({
      courseId: course3.id,
      authorId: students[2].id,
      title: 'Essay Topic Ideas',
      content: 'I\'m looking for ideas for the argumentative essay. What topics are you all considering?'
    });

    console.log('Discussions created.');

    console.log('\n==============================================');
    console.log('Database seeding completed successfully!');
    console.log('==============================================\n');
    console.log('Sample Login Credentials:\n');
    console.log('Admin:');
    console.log('  Email: admin@lms.com');
    console.log('  Password: admin123\n');
    console.log('Instructors:');
    console.log('  Email: john.smith@lms.com');
    console.log('  Password: instructor123');
    console.log('  Email: sarah.johnson@lms.com');
    console.log('  Password: instructor123\n');
    console.log('Students:');
    console.log('  Email: alice.brown@student.lms.com');
    console.log('  Password: student123');
    console.log('  Email: bob.wilson@student.lms.com');
    console.log('  Password: student123');
    console.log('  (+ 3 more students with similar pattern)\n');
    console.log('==============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
