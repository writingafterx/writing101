const express = require('express');
const router = express.Router();
const { Course, User, Enrollment, Assignment } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all courses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const where = {};
    if (req.query.semester) where.semester = req.query.semester;
    if (req.query.year) where.year = req.query.year;

    const courses = await Course.findAll({
      where,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['year', 'DESC'], ['semester', 'DESC'], ['code', 'ASC']]
    });

    res.json({ courses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single course
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'students',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { attributes: ['status', 'finalGrade', 'letterGrade'] }
        },
        {
          model: Assignment,
          as: 'assignments'
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json({ course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create course (instructor/admin only)
router.post('/', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const { code, title, description, syllabus, semester, year, credits, startDate, endDate } = req.body;

    const course = await Course.create({
      code,
      title,
      description,
      syllabus,
      semester,
      year,
      credits,
      startDate,
      endDate,
      instructorId: req.user.id
    });

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update course
router.put('/:id', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Instructors can only update their own courses
    if (req.user.role === 'instructor' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await course.update(req.body);
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete course (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await course.update({ isActive: false });
    res.json({ message: 'Course deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enroll student in course
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const { studentId } = req.body;

    // Students can only enroll themselves, instructors/admins can enroll others
    const targetStudentId = studentId || req.user.id;
    if (req.user.role === 'student' && targetStudentId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: { courseId, studentId: targetStudentId }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      courseId,
      studentId: targetStudentId
    });

    res.status(201).json({
      message: 'Enrolled successfully',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Drop course
router.post('/:id/drop', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.body.studentId || req.user.id;

    const enrollment = await Enrollment.findOne({
      where: { courseId, studentId }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await enrollment.update({ status: 'dropped' });
    res.json({ message: 'Course dropped successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
