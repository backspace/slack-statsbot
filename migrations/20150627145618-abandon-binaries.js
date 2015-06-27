'use strict';

module.exports = {
  up: function (migration, DataTypes) {
    return migration.addColumn(
      'Users',
      'manness',
      DataTypes.STRING
    ).then(function() {
      return migration.addColumn(
        'Users',
        'pocness',
        DataTypes.STRING
      );
    }).then(function() {
      return migration.sequelize.query('UPDATE "Users" SET manness = \'a man\' WHERE "isMan" IS TRUE');
    }).then(function() {
      return migration.sequelize.query('UPDATE "Users" SET manness = \'not a man\' WHERE "isMan" IS FALSE');
    }).then(function() {
      return migration.sequelize.query('UPDATE "Users" SET pocness = \'a PoC\' WHERE "isPersonOfColour" IS TRUE');
    }).then(function() {
      return migration.sequelize.query('UPDATE "Users" SET pocness = \'not a PoC\' WHERE "isPersonOfColour" IS FALSE');
    })
  },

  down: function (migration, DataTypes) {
    return migration.removeColumn('Users', 'manness').then(function() {
      return migration.removeColumn('Users', 'pocness');
    })
  }
};
