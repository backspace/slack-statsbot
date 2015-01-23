var SlackClient = require('slack-client');
var MessageLog = require('./message-log');

class StatsBot {
  constructor(adapter) {
    this.adapter = adapter;
    this.adapter.registerListener(this);

    this.log = new MessageLog();
  }

  handleChannelMessage(channel, message) {
    this.log.logMessage(message);
  }

  handleDirectMessage(channel, message) {
    var isMan = message.text === 'true';

    var reply;

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
