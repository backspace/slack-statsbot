var SlackClient = require('slack-client');
var MessageLog = require('./message-log');

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
      } else {
        reply = 'We have you down here as not being a man.';
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

  reportChannelStatistics(channelName) {
    var channel = this.adapter.getChannelByName(channelName);
    var statistics = this.log.getChannelStatistics(channel.id);

    for (var userID of Object.keys(statistics)) {
      var user = this.adapter.getUser(userID);
      channel.send(`${user.name} message count in #${channel.name}: ${statistics[userID]}`);
    }
  }
}

module.exports = StatsBot
