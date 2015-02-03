var SlackClient = require('slack-client');
var MessageLog = require('./message-log');

var RepositoryAttributeExtractor = require('./repository-attribute-extractor');

var VerboseGenderReportGenerator = require('./verbose-gender-report-generator');
var TerseGenderReportGenerator = require('./terse-gender-report-generator');

var values = require('amp-values');

class StatsBot {
  constructor(adapter, userRepository, statsChannel) {
    this.adapter = adapter;
    this.adapter.registerListener(this);

    this.log = new MessageLog();
    this.userRepository = userRepository;

    this.statsChannel = statsChannel;
  }

  handleChannelMessage(channel, message) {
    if (this.mustNotLog(message)) { return; }
    this.log.logMessage(message);
  }

  mustNotLog(message) {
    if (this.adapter.getChannel(message.channel).name == this.statsChannel) {
      return true;
    }

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
    var botChannel = this.adapter.getChannelByName(this.statsChannel);
    var statisticsPackage = this.log.getChannelStatistics(channel.id);

    if (!statisticsPackage) {
      return;
    }

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
      var fullReport = new VerboseGenderReportGenerator(statistics, userIsMan, metadata.startTime, channel.name).generate();
      botChannel.send(fullReport);

      var terseReport = new TerseGenderReportGenerator(statistics, userIsMan, metadata.startTime, botChannel.name).generate();
      channel.send(terseReport);
    });
  }

  reportAllChannelStatistics() {
    for (let channelID of this.log.getChannels()) {
      this.reportChannelStatistics(channelID);
    }
  }
}

module.exports = StatsBot
