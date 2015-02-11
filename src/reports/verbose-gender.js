// TODO this is untested, but its components are tested, and it’s semi-covered by the messy integration-y statsbot test

var values = require('amp-values');

var Table = require('cli-table');

// TODO these names are unwieldy and can probably be broken up and simplified

var GenderMessageCountStatisticsGenerator = require('../calculators/gender-message-count');

var GenderParticipantCountStatisticsGenerator = require('../calculators/gender-participant-count');

var percentagesFromCounts = require('../calculators/percentages-from-counts');

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

    var participantCountStatistics = new GenderParticipantCountStatisticsGenerator(this.userMessageCount, this.userIsMan).generate();

    var participantCount = values(participantCountStatistics).reduce(function(total, genderCount) {
      return total + genderCount;
    }, 0);

    var messagePercents = percentagesFromCounts(messageCountStatistics);
    var participantPercents = percentagesFromCounts(participantCountStatistics);


    var table = new Table({
      head: ['', 'messages', 'participants'],
      style: {
        head: [],
        border: []
      }
    });

    table.push(['men', `${messagePercents.men}%`, `${participantPercents.men}%`]);
    table.push(['not-men', `${messagePercents.notMen}%`, `${participantPercents.notMen}%`]);
    table.push(['unknown', `${messagePercents.unknown}%`, `${participantPercents.unknown}%`]);
    table.push([]);
    table.push(['counts', messageCount, participantCount]);

    var report = '```\n' + table.toString() + '\n```';

    return report;
  }
}

module.exports = VerboseGenderReportGenerator;
