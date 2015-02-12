// TODO this is untested, but its components are tested, and it’s semi-covered by the messy integration-y statsbot test

var messageAndParticipantTable = require('./message-and-participant-table');

// TODO these names are unwieldy and can probably be broken up and simplified

var GenderMessageCountStatisticsGenerator = require('../calculators/gender-message-count');

var GenderParticipantCountStatisticsGenerator = require('../calculators/gender-participant-count');

class VerboseGenderReportGenerator {
  constructor(userMessageCount, userIsMan) {
    this.userMessageCount = userMessageCount;
    this.userIsMan = userIsMan;
  }

  generate() {
    var messageCountStatistics = new GenderMessageCountStatisticsGenerator(this.userMessageCount, this.userIsMan).generate();

    var participantCountStatistics = new GenderParticipantCountStatisticsGenerator(this.userMessageCount, this.userIsMan).generate();

    var table = messageAndParticipantTable(
      messageCountStatistics,
      participantCountStatistics,
      {
        'men': 'men',
        'notMen': 'not-men',
        'unknown': 'unknown'
      }
    );

    var report = '```\n' + table.toString() + '\n```';

    return report;
  }
}

module.exports = VerboseGenderReportGenerator;
