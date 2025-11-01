const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Assignment = require('./Assignment');
const Submission = require('./Submission');
const Discussion = require('./Discussion');
const DiscussionReply = require('./DiscussionReply');
const Enrollment = require('./Enrollment');

// Define associations

// User - Course (Instructor)
User.hasMany(Course, {
  foreignKey: 'instructorId',
  as: 'taughtCourses'
});
Course.belongsTo(User, {
  foreignKey: 'instructorId',
  as: 'instructor'
});

// User - Course (Student Enrollments) - Many to Many
User.belongsToMany(Course, {
  through: Enrollment,
  foreignKey: 'studentId',
  as: 'enrolledCourses'
});
Course.belongsToMany(User, {
  through: Enrollment,
  foreignKey: 'courseId',
  as: 'students'
});

// Direct access to enrollments
User.hasMany(Enrollment, { foreignKey: 'studentId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId' });
Enrollment.belongsTo(User, { foreignKey: 'studentId', as: 'student' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

// Course - Assignment
Course.hasMany(Assignment, {
  foreignKey: 'courseId',
  as: 'assignments'
});
Assignment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// Assignment - Submission
Assignment.hasMany(Submission, {
  foreignKey: 'assignmentId',
  as: 'submissions'
});
Submission.belongsTo(Assignment, {
  foreignKey: 'assignmentId',
  as: 'assignment'
});

// User - Submission (Student)
User.hasMany(Submission, {
  foreignKey: 'studentId',
  as: 'submissions'
});
Submission.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student'
});

// Course - Discussion
Course.hasMany(Discussion, {
  foreignKey: 'courseId',
  as: 'discussions'
});
Discussion.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

// User - Discussion (Author)
User.hasMany(Discussion, {
  foreignKey: 'authorId',
  as: 'discussions'
});
Discussion.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

// Discussion - DiscussionReply
Discussion.hasMany(DiscussionReply, {
  foreignKey: 'discussionId',
  as: 'replies'
});
DiscussionReply.belongsTo(Discussion, {
  foreignKey: 'discussionId',
  as: 'discussion'
});

// User - DiscussionReply (Author)
User.hasMany(DiscussionReply, {
  foreignKey: 'authorId',
  as: 'replies'
});
DiscussionReply.belongsTo(User, {
  foreignKey: 'authorId',
  as: 'author'
});

module.exports = {
  sequelize,
  User,
  Course,
  Assignment,
  Submission,
  Discussion,
  DiscussionReply,
  Enrollment
};
