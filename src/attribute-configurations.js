var fs = require('fs');
var map = require('lodash.map');

var path = require('path');
var attributesPath = path.resolve(__dirname, '../attributes/');

module.exports = [
  require('../attributes/pocness.json'),
  require('../attributes/manness.json')
];
