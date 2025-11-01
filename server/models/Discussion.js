const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Discussion = sequelize.define('Discussion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true
});

module.exports = Discussion;
