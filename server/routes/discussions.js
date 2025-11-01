const express = require('express');
const router = express.Router();
const { Discussion, DiscussionReply, Course, User } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all discussions for a course
router.get('/course/:courseId', authenticateToken, async (req, res) => {
  try {
    const discussions = await Discussion.findAll({
      where: { courseId: req.params.courseId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: DiscussionReply,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName']
            }
          ]
        }
      ],
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
        [{ model: DiscussionReply, as: 'replies' }, 'createdAt', 'ASC']
      ]
    });

    res.json({ discussions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single discussion
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: DiscussionReply,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    res.json({ discussion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create discussion
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { courseId, title, content } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const discussion = await Discussion.create({
      courseId,
      title,
      content,
      authorId: req.user.id
    });

    res.status(201).json({
      message: 'Discussion created successfully',
      discussion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update discussion
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    // Only author or instructor/admin can update
    if (discussion.authorId !== req.user.id && !['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await discussion.update(req.body);
    res.json({ message: 'Discussion updated successfully', discussion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete discussion
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (discussion.authorId !== req.user.id && !['admin', 'instructor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    await discussion.destroy();
    res.json({ message: 'Discussion deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add reply to discussion
router.post('/:id/replies', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findByPk(req.params.id);

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    if (discussion.isLocked) {
      return res.status(400).json({ error: 'Discussion is locked' });
    }

    const reply = await DiscussionReply.create({
      discussionId: req.params.id,
      authorId: req.user.id,
      content
    });

    const replyWithAuthor = await DiscussionReply.findByPk(reply.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      message: 'Reply added successfully',
      reply: replyWithAuthor
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pin/unpin discussion (instructor/admin only)
router.post('/:id/pin', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    await discussion.update({ isPinned: !discussion.isPinned });
    res.json({
      message: `Discussion ${discussion.isPinned ? 'pinned' : 'unpinned'} successfully`,
      discussion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Lock/unlock discussion (instructor/admin only)
router.post('/:id/lock', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const discussion = await Discussion.findByPk(req.params.id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    await discussion.update({ isLocked: !discussion.isLocked });
    res.json({
      message: `Discussion ${discussion.isLocked ? 'locked' : 'unlocked'} successfully`,
      discussion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
