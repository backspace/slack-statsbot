"use strict";
module.exports = function(sequelize, DataTypes) {
  var Channel = sequelize.define("Channel", {
    slackID: DataTypes.STRING,
    ignoredAttributes: DataTypes.ARRAY(DataTypes.STRING)
  }, {});
  return Channel;
};
