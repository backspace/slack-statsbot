module.exports = function(counts) {
  var total = Object.keys(counts).reduce(function(total, key) {
    return total + counts[key];
  }, 0);

  return Object.keys(counts).reduce(function(percentages, key) {
    percentages[key] = (100*counts[key]/total).toFixed(0);
    return percentages;
  }, {});
}
