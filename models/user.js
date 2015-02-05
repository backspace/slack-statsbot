"use strict";
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    isMan: DataTypes.BOOLEAN,
    slackID: DataTypes.STRING,
    hasBeenQueried: DataTypes.BOOLEAN
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return User;
};
