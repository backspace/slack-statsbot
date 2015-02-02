var SlackClient = require('slack-client');
var MessageLog = require('./message-log');

var RepositoryAttributeExtractor = require('./repository-attribute-extractor');

// TODO these names are unwieldy and can probably be broken up and simplified

var GenderMessageCountStatisticsGenerator = require('./gender-message-count-statistics-generator');
var GenderMessageCountReportGenerator = require('./gender-message-count-report-generator');

var GenderParticipantCountStatisticsGenerator = require('./gender-participant-count-statistics-generator');
var GenderParticipantCountReportGenerator = require('./gender-participant-count-report-generator');

var moment = require('moment');
var values = require('amp-values');

class StatsBot {
  constructor(adapter, userRepository) {
    this.adapter = adapter;
    this.adapter.registerListener(this);

    this.log = new MessageLog();
    this.userRepository = userRepository;
  }

  handleChannelMessage(channel, message) {
    if (this.mustNotLog(message)) { return; }
    this.log.logMessage(message);
  }

  mustNotLog(message) {
    // Message subtypes are listed here:
    // https://api.slack.com/events/message
    var subtypesToLog = [
      'me_message',
      'file_share',
      'file_comment'
    ];

    if (message.subtype) {
      return subtypesToLog.indexOf(message.subtype) == -1;
    } else {
      return false;
    }
  }

  handleDirectMessage(channel, message) {
    if (message.text === 'info') {
      this.handleInformationRequest(channel, message);
    } else {
      this.handleInformationUpdate(channel, message);
    }
  }

  handleInformationRequest(channel, message) {
    this.userRepository.retrieveAttribute(message.user, 'isMan').then(function(isMan) {
      var reply;

      if (isMan) {
        reply = 'We have you down here as being a man.';
      } else if (isMan === false) {
        reply = 'We have you down here as not being a man.';
      } else {
        reply = 'We don’t have you on record! Please say “true” if you are a man and “false” if you are not.';
      }

      channel.send(reply);
    });
  }

  handleInformationUpdate(channel, message) {
    var isMan = message.text === 'true';

    var reply;

    this.userRepository.storeAttribute(message.user, 'isMan', isMan);

    if (isMan) {
      reply = 'Okay, we have noted that you are a man. Say “false” if that is not the case.';
    } else {
      reply = 'Okay, we have noted that you are not a man. Say “true” if you are a man.';
    }

    channel.send(reply);
  }

  reportChannelStatistics(channelID) {
    var channel = this.adapter.getChannel(channelID);
    var statisticsPackage = this.log.getChannelStatistics(channel.id);

    var statistics = statisticsPackage.statistics;
    var metadata = statisticsPackage.metadata;

    var counts = values(statistics);
    var total = counts.reduce(function(total, count) {
      return total + count;
    }, 0);

    if (total === 0) {
      return;
    }

    var isManExtractor = new RepositoryAttributeExtractor(this.userRepository, 'isMan', Object.keys(statistics));

    isManExtractor.extract().then(function(userIsMan) {
      var messageCountStatistics = new GenderMessageCountStatisticsGenerator(statistics, userIsMan).generate();
      var messageCountReport = new GenderMessageCountReportGenerator(messageCountStatistics).generate();

      var participantCountStatistics = new GenderParticipantCountStatisticsGenerator(statistics, userIsMan).generate();
      var participantCountReport = new GenderParticipantCountReportGenerator(participantCountStatistics).generate();

      var participantCount = values(participantCountStatistics).reduce(function(total, genderCount) {
        return total + genderCount;
      }, 0);

      var fullReport = `Of the ${total} message${total == 1 ? '' : 's'} since ${moment(metadata.startTime).fromNow()}, ${messageCountReport}. Of the ${participantCount} participant${participantCount == 1 ? '' : 's'}, ${participantCountReport}. DM me to make sure you’re recognised.`;

      channel.send(fullReport);
    });
  }

  reportAllChannelStatistics() {
    for (let channelID of this.log.getChannels()) {
      this.reportChannelStatistics(channelID);
    }
  }
}

module.exports = StatsBot
