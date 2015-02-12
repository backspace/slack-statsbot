// TODO there’s little difference between this and the gender report;
// the calculators are simple wrappers for trinaryCounter and trinaryGrouper

var messageAndParticipantTable = require('./message-and-participant-table');

var RaceMessageCountStatisticsGenerator = require('../calculators/race-message-count');

var RaceParticipantCountStatisticsGenerator = require('../calculators/race-participant-count');

class VerboseRaceReportGenerator {
  constructor(userMessageCount, userIsPersonOfColour) {
    this.userMessageCount = userMessageCount;
    this.userIsPersonOfColour = userIsPersonOfColour;
  }

  generate() {
    var messageCountStatistics = new RaceMessageCountStatisticsGenerator(this.userMessageCount, this.userIsPersonOfColour).generate();

    var participantCountStatistics = new RaceParticipantCountStatisticsGenerator(this.userMessageCount, this.userIsPersonOfColour).generate();

    var table = messageAndParticipantTable(
      messageCountStatistics,
      participantCountStatistics,
      {
        'peopleOfColour': 'PoC',
        'whitePeople': 'not-PoC',
        'unknown': 'unknown'
      }
    );

    var report = '```\n' + table.toString() + '\n```';

    return report;
  }
}

module.exports = VerboseRaceReportGenerator;
