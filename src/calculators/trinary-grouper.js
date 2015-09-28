// TODO better name?

// statistics = {
//   a: 1,
//   b: 2,
//   c: 1
// };
//
// mappings = {
//   'M': 'men',
//   'N': 'notMen',
//   else: 'unknown'
// };
//
// values = {
//   a: 'M',
//   b: 'N',
// };
//
// =>
//
// {
//   men: 1,
//   notMen: 2,
//   unknown: 1
// }

module.exports = function(statistics, values, mappings) {
  var userIDs = Object.keys(statistics);

  var emptyResult = {};

  var mappingKeys = Object.keys(mappings).map(function(key) {
    return key.toString();
  });

  mappingKeys.forEach(function(mappingKey) {
    emptyResult[mappings[mappingKey]] = 0;
  });

  var counts = userIDs.reduce(function(counts, userID) {
    var value = values[userID];
    if (value !== undefined && value !== null) value = value.toString();
    var count = statistics[userID];

    var indexOfMatchingMappingKey = mappingKeys.indexOf(value);

    if (indexOfMatchingMappingKey > -1) {
      counts[mappings[value]] += count;
    } else {
      counts[mappings.else] += count;
    }

    return counts;
  }, emptyResult);

  return counts;
};
