// TODO better name?

// statistics = {
//   a: 1,
//   b: 2,
//   c: 1
// };
//
// mappings = {
//   true: 'men',
//   false: 'notMen',
//   else: 'unknown'
// };
//
// values = {
//   a: true,
//   b: false,
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
  emptyResult[mappings.true] = 0;
  emptyResult[mappings.false] = 0;
  emptyResult[mappings.else] = 0;

  var counts = userIDs.reduce(function(counts, userID) {
    var value = values[userID];
    var count = statistics[userID];

    if (value) {
      counts[mappings.true] += count;
    } else if (value === false) {
      counts[mappings.false] += count;
    } else {
      counts[mappings.else] += count;
    }

    return counts;
  }, emptyResult);

  return counts;
};
