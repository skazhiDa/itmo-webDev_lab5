const sequelize = require('./db');
const { DataTypes } = require('sequelize');

const Client = sequelize.define('client', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  createdAt: { type: DataTypes.DATE },
  updatedAt: { type: DataTypes.DATE },
  name: { type: DataTypes.STRING },
  surname: { type: DataTypes.STRING },
  lastName: { type: DataTypes.STRING },
  contacts: { type: DataTypes.JSON },
});

module.exports = { Client };
