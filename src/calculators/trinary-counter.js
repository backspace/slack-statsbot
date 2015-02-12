module.exports = function(statistics, values, mappings) {
  var userIDs = Object.keys(statistics);

  var emptyResult = {};
  emptyResult[mappings.true] = 0;
  emptyResult[mappings.false] = 0;
  emptyResult[mappings.else] = 0;

  var counts = userIDs.reduce(function(counts, userID) {
    var value = values[userID];

    if (value) {
      counts[mappings.true] += 1;
    } else if (value === false) {
      counts[mappings.false] += 1;
    } else {
      counts[mappings.else] += 1;
    }

    return counts;
  }, emptyResult);

  return counts;
};
