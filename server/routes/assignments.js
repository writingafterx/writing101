const express = require('express');
const router = express.Router();
const { Assignment, Course, Submission, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all assignments for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const assignments = await Assignment.findAll({
      where: { courseId: req.params.courseId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'code', 'title']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single assignment with submissions
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: 'course'
        },
        {
          model: Submission,
          as: 'submissions',
          include: [
            {
              model: User,
              as: 'student',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create assignment (instructor/admin only)
router.post('/', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const { courseId, title, description, instructions, dueDate, maxPoints, allowLateSubmission } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    if (req.user.role === 'instructor' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      instructions,
      dueDate,
      maxPoints,
      allowLateSubmission
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update assignment
router.put('/:id', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (req.user.role === 'instructor' && assignment.course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await assignment.update(req.body);
    res.json({ message: 'Assignment updated successfully', assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete assignment
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (req.user.role === 'instructor' && assignment.course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await assignment.destroy();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit assignment (students)
router.post('/:id/submit', authenticateToken, authorizeRoles('student'), async (req, res) => {
  try {
    const { content, attachmentUrl } = req.body;
    const assignment = await Assignment.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ error: 'Late submissions not allowed' });
    }

    const existingSubmission = await Submission.findOne({
      where: { assignmentId: req.params.id, studentId: req.user.id }
    });

    if (existingSubmission) {
      await existingSubmission.update({
        content,
        attachmentUrl,
        submittedAt: now,
        status: isLate ? 'late' : 'submitted'
      });

      return res.json({
        message: 'Submission updated successfully',
        submission: existingSubmission
      });
    }

    const submission = await Submission.create({
      assignmentId: req.params.id,
      studentId: req.user.id,
      content,
      attachmentUrl,
      status: isLate ? 'late' : 'submitted'
    });

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grade submission (instructor/admin only)
router.post('/submissions/:submissionId/grade', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    const submission = await Submission.findByPk(req.params.submissionId, {
      include: [
        {
          model: Assignment,
          as: 'assignment',
          include: [{ model: Course, as: 'course' }]
        }
      ]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (req.user.role === 'instructor' && submission.assignment.course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await submission.update({
      grade,
      feedback,
      status: 'graded'
    });

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
