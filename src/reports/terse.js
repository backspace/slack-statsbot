// TODO also untested except by integration

var moment = require('moment');
var values = require('amp-values');

var GenderMessageCountStatisticsGenerator = require('../calculators/gender-message-count');
var RaceMessageCount = require('../calculators/race-message-count');

class TerseReportGenerator {
  constructor(userMessageCount, userIsMan, userIsPersonOfColour, startTime, statsChannel) {
    this.userMessageCount = userMessageCount;
    // FIXME should collect attributes into an object?
    // also querying the table multiple times, inefficient
    this.userIsMan = userIsMan;
    this.userIsPersonOfColour = userIsPersonOfColour;
    this.startTime = startTime;
    this.statsChannel = statsChannel;
  }

  generate() {
    var genderMessageCountStatistics = new GenderMessageCountStatisticsGenerator(this.userMessageCount, this.userIsMan).generate();
    var raceMessageCount = new RaceMessageCount(this.userMessageCount, this.userIsPersonOfColour).generate();

    var total = genderMessageCountStatistics.men + genderMessageCountStatistics.notMen + genderMessageCountStatistics.unknown;

    var notMenPercent = (100*genderMessageCountStatistics.notMen/total).toFixed(0);
    var peopleOfColourPercent = (100*raceMessageCount.peopleOfColour/total).toFixed(0);



    var report = `Since ${moment(this.startTime).fromNow()}, not-men sent ${notMenPercent}% of messages and people of colour sent ${peopleOfColourPercent}% of messages. See #${this.statsChannel} for more details.`;

    return report;
  }
}

module.exports = TerseReportGenerator;
