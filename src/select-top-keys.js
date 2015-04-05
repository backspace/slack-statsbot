// Selects the keys from an object whose values are in the top N of all values

var values = require('lodash.values');
var unique = require('lodash.uniq');

module.exports = function(object, n) {
  var objectValues = values(object);
  var sorted = objectValues.sort();
  var uniqueValues = unique(sorted);

  var threshold = uniqueValues[Math.max(uniqueValues.length - n, 0)];

  return Object.keys(object).reduce(function(selectedKeys, key) {
    if (object[key] >= threshold) {
      selectedKeys.push(key);
    }

    return selectedKeys;
  }, []);
}
