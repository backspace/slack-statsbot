// TODO also untested except by integration

var moment = require('moment');
var values = require('amp-values');

var GenderMessageCountStatisticsGenerator = require('../calculators/gender-message-count');

class TerseGenderReportGenerator {
  constructor(userMessageCount, userIsMan, startTime, statsChannel) {
    this.userMessageCount = userMessageCount;
    this.userIsMan = userIsMan;
    this.startTime = startTime;
    this.statsChannel = statsChannel;
  }

  generate() {
    var messageCountStatistics = new GenderMessageCountStatisticsGenerator(this.userMessageCount, this.userIsMan).generate();

    var total = messageCountStatistics.men + messageCountStatistics.notMen + messageCountStatistics.unknown;

    var notMenPercent = (100*messageCountStatistics.notMen/total).toFixed(0);

    var report = `Since ${moment(this.startTime).fromNow()}, not-men sent ${notMenPercent}% of messages. See #${this.statsChannel} for more details.`;

    return report;
  }
}

module.exports = TerseGenderReportGenerator;
