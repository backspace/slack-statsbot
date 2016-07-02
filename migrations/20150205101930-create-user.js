"use strict";
module.exports = {
  up: function(migration, DataTypes) {
    return migration.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      isMan: {
        type: DataTypes.BOOLEAN
      },
      slackID: {
        unique: true,
        type: DataTypes.STRING
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    });
  },
  down: function(migration, DataTypes) {
    return migration.dropTable("Users");
  }
};
