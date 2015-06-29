var fs = require('fs');
var map = require('lodash.map');

module.exports = map(fs.readdirSync('attributes/'), function(filename) {
  return require(`../attributes/${filename}`);
});
