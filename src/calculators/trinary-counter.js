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
    if (value !== undefined) value = value.toString();

    var indexOfMatchingMappingKey = mappingKeys.indexOf(value);

    if (indexOfMatchingMappingKey > -1) {
      counts[mappings[value]] += 1;
    } else {
      counts[mappings.else] += 1;
    }

    return counts;
  }, emptyResult);

  return counts;
};
