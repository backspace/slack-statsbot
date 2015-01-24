var SlackClient = require('slack-client');
var MessageLog = require('./message-log');
var GenderReportGenerator = require('./gender-report-generator');

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
    this.log.logMessage(message);
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
      reply = 'Okay, we have noted that you are a man.';
    } else {
      reply = 'Okay, we have noted that you are not a man.';
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

    channel.send(`Statistics since ${moment(metadata.startTime).fromNow()}:`);

    channel.send(`Total message count: ${total}`);

    var generator = new GenderReportGenerator(statistics, this.userRepository);

    generator.generate().then(function(report) {
      report.forEach(function(item) {
        channel.send(item);
      });

      channel.send(`Direct message me with “true” if you are a man and “false” otherwise. You can say “info” to check how I have you recorded.`);
    });
  }

  reportAllChannelStatistics() {
    for (let channelID of this.log.getChannels()) {
      this.reportChannelStatistics(channelID);
    }
  }
}

module.exports = StatsBot
