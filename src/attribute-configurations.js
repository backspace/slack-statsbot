var fs = require('fs');
var map = require('lodash.map');

var path = require('path');
var attributesPath = path.resolve(__dirname, '../attributes/');

module.exports = map(fs.readdirSync(attributesPath), function(filename) {
  return require(`../attributes/${filename}`);
});
