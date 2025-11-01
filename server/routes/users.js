const express = require('express');
const router = express.Router();
const { User, Enrollment, Course } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all users (admin/instructor only)
router.get('/', authenticateToken, authorizeRoles('admin', 'instructor'), async (req, res) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Course,
          as: 'enrolledCourses',
          through: { attributes: ['status', 'finalGrade', 'letterGrade'] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { firstName, lastName, email, avatar } = req.body;
    await user.update({ firstName, lastName, email, avatar });

    res.json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete/deactivate user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({ isActive: false });
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
