// Returns a filtered version of the first argument
// where all keys whose value is defined in the second argument are removed

module.exports = function(source, values) {
  return Object.keys(source).reduce(function(selected, key) {
    if (values[key] === undefined) {
      selected[key] = source[key];
    }

    return selected;
  }, {});
}
