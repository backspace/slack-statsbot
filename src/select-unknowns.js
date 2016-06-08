// Returns a filtered version of the first argument
// where all keys whose value is defined in each item of the second argument are removed

module.exports = function(source, valuesList) {
  return Object.keys(source).reduce(function(selected, key) {
    if (valuesList.filter(values => values[key] === undefined || values[key] === null).length) {
      selected[key] = source[key];
    }

    return selected;
  }, {});
}
