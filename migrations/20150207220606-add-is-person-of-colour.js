"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'Users',
      'isPersonOfColour',
      DataTypes.BOOLEAN
    );
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn(
      'Users',
      'isPersonOfColour'
    );
    done();
  }
};
