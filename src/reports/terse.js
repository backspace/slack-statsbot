// TODO also untested except by integration

var moment = require('moment');
var values = require('lodash.values');
var find = require('lodash.find');

var trinaryGrouper = require('../calculators/trinary-grouper');

class TerseReportGenerator {
  constructor(userMessageCount, configurationAndValues, startTime, statsChannel) {
    this.userMessageCount = userMessageCount;
    // FIXME should collect attributes into an object?
    // also querying the table multiple times, inefficient
    this.configurationAndValues = configurationAndValues;
    this.startTime = startTime;
    this.statsChannel = statsChannel;
  }

  generate() {
    var total = values(this.userMessageCount).reduce(function(sum, value) {
      return sum + value;
    }, 0);

    var report = `Since ${moment(this.startTime).fromNow()}, `;

    this.configurationAndValues.forEach(function(configurationAndValues, index) {
      var configuration = configurationAndValues.configuration;
      var values = configurationAndValues.values;

      var valueToReport = find(configuration.values, function(value) {
        return value.value === configuration.terseReportValue;
      });

      // TODO this is duplicated in reports/verbose-attribute
      var countMappings = {};

      configuration.values.forEach(function(valueConfiguration) {
        countMappings[valueConfiguration.value] = valueConfiguration.texts.statistics;
      });

      countMappings.else = configuration.unknownValue.texts.statistics;

      var messageCounts = trinaryGrouper(
        this.userMessageCount,
        values,
        countMappings
      );

      var relevantMessageCount = messageCounts[valueToReport.texts.statistics];
      var percent = (100*relevantMessageCount/total).toFixed(0);

      if (index > 0) {
        report += 'and ';
      }

      report += `self-identified ${valueToReport.texts.terse} sent ${percent}% of messages`;
    }.bind(this));

    report += `. See <#${this.statsChannel}> for more details. DM me to self-identify.`;

    return report;
  }
}

module.exports = TerseReportGenerator;
