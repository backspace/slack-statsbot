"use strict";

module.exports = {
  up: function(migration, DataTypes) {
    return migration.addColumn(
      'Users',
      'isPersonOfColour',
      DataTypes.BOOLEAN
    );
  },

  down: function(migration, DataTypes) {
    return migration.removeColumn(
      'Users',
      'isPersonOfColour'
    );
  }
};
