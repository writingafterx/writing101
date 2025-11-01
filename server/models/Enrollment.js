const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Enrollment = sequelize.define('Enrollment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  enrollmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
    type: DataTypes.ENUM('active', 'dropped', 'completed'),
    defaultValue: 'active'
  },
  finalGrade: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  letterGrade: {
    type: DataTypes.STRING(2),
    allowNull: true
  }
}, {
  timestamps: true
});

module.exports = Enrollment;
