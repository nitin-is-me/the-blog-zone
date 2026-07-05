const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Blogger = sequelize.define("Blogger", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,
  },
  resetOtp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  resetOtpExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isBanned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isWarningSuppressed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
});

module.exports = Blogger;