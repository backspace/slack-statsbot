var Table = require('cli-table');
var values = require('amp-values');

var percentagesFromCounts = require('../calculators/percentages-from-counts');

var sumObjectValues = function(object) {
  return values(object).reduce(function(total, value) {
    return total + value;
  }, 0);
};

module.exports = function(messageCounts, participantCounts, propertiesToLabels) {
  var table = new Table({
    head: ['', 'messages', 'participants'],
    style: {
      head: [],
      border: []
    }
  });

  var messageCount = sumObjectValues(messageCounts);
  var participantCount = sumObjectValues(participantCounts);

  var messagePercents = percentagesFromCounts(messageCounts);
  var participantPercents = percentagesFromCounts(participantCounts);

  Object.keys(propertiesToLabels).forEach(function(property) {
    var label = propertiesToLabels[property];

    table.push([label, `${messagePercents[property]}%`, `${participantPercents[property]}`]);
  });

  table.push([]);
  table.push(['counts', messageCount, participantCount]);

  return table;
};
