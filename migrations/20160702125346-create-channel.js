'use strict';

module.exports = {
  up: function(migration, DataTypes) {
    return migration.createTable("Channels", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      slackID: {
        unique: true,
        type: DataTypes.STRING
      },
      ignoredAttributes: {
        defaultValue: [],
        type: DataTypes.ARRAY(DataTypes.STRING)
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
    return migration.dropTable("Channels");
  }
};
