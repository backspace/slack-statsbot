// TODO this is untested, but its components are tested, and it’s semi-covered by the messy integration-y statsbot test

var moment = require('moment');
var values = require('amp-values');

// TODO these names are unwieldy and can probably be broken up and simplified

var GenderMessageCountStatisticsGenerator = require('./gender-message-count-statistics-generator');
var GenderMessageCountReportGenerator = require('./gender-message-count-report-generator');

var GenderParticipantCountStatisticsGenerator = require('./gender-participant-count-statistics-generator');
var GenderParticipantCountReportGenerator = require('./gender-participant-count-report-generator');

class VerboseGenderReportGenerator {
  constructor(userMessageCount, userIsMan, startTime, channelName) {
    this.userMessageCount = userMessageCount;
    this.userIsMan = userIsMan;
    this.startTime = startTime;
    this.channelName = channelName;
  }

  generate() {
    // TODO this is copied from statsbot
    var counts = values(this.userMessageCount);
    var messageCount = counts.reduce(function(total, count) {
      return total + count;
    }, 0);

    var messageCountStatistics = new GenderMessageCountStatisticsGenerator(this.userMessageCount, this.userIsMan).generate();
    var messageCountReport = new GenderMessageCountReportGenerator(messageCountStatistics).generate();

    var participantCountStatistics = new GenderParticipantCountStatisticsGenerator(this.userMessageCount, this.userIsMan).generate();
    var participantCountReport = new GenderParticipantCountReportGenerator(participantCountStatistics).generate();

    var participantCount = values(participantCountStatistics).reduce(function(total, genderCount) {
      return total + genderCount;
    }, 0);

    var fullReport = `Of the ${messageCount} message${messageCount == 1 ? '' : 's'} in #${this.channelName} since ${moment(this.startTime).fromNow()}, ${messageCountReport}. Of the ${participantCount} participant${participantCount == 1 ? '' : 's'}, ${participantCountReport}. DM me to make sure you’re recognised.`;

    return fullReport;
  }
}

module.exports = VerboseGenderReportGenerator;
