"use strict";

module.exports = {
  up: function(migration, DataTypes, done) {
    migration.addColumn(
      'Users',
      'hasBeenQueried',
      DataTypes.BOOLEAN
    );
    done();
  },

  down: function(migration, DataTypes, done) {
    migration.removeColumn(
      'Users',
      'hasBeenQueried'
    );
    done();
  }
};
