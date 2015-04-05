var messageAndParticipantTable = require('./message-and-participant-table');

var trinaryCounter = require('../calculators/trinary-counter');
var trinaryGrouper = require('../calculators/trinary-grouper');

class VerboseReportGenerator {
  constructor(userMessageCount, attributeValues, attributeConfiguration) {
    this.userMessageCount = userMessageCount;
    this.attributeValues = attributeValues;
    this.attributeConfiguration = attributeConfiguration;

    this.countMappings = {};
    this.tableMappings = {};

    attributeConfiguration.values.forEach(function(valueConfiguration) {
      this.countMappings[valueConfiguration.value] = valueConfiguration.texts.statistics;
      this.tableMappings[this.countMappings[valueConfiguration.value]] = valueConfiguration.texts.table;
  }.bind(this));

    this.countMappings.else = attributeConfiguration.unknownValue.texts.statistics;
    this.tableMappings.unknown = attributeConfiguration.unknownValue.texts.table;
  }

  generate() {

    var messageCounts = trinaryGrouper(
      this.userMessageCount,
      this.attributeValues,
      this.countMappings
    );

    var participantCounts = trinaryCounter(
      this.userMessageCount,
      this.attributeValues,
      this.countMappings
    );

    var table = messageAndParticipantTable(
      messageCounts,
      participantCounts,
      this.tableMappings
    );

    var report = '```\n' + table.toString() + '\n```';

    return report;
  }
}

module.exports = VerboseReportGenerator;
