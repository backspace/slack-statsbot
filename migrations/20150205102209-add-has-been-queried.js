"use strict";

module.exports = {
  up: function(migration, DataTypes) {
    return migration.addColumn(
      'Users',
      'hasBeenQueried',
      DataTypes.BOOLEAN
    );
  },

  down: function(migration, DataTypes) {
    return migration.removeColumn(
      'Users',
      'hasBeenQueried'
    );
  }
};
