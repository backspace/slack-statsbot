var SlackClient = require('slack-client');
var MessageLog = require('./message-log');

class StatsBot {
  constructor(client) {
    this.client = client || new SlackClient(process.env.SLACK_TOKEN);
    this.client.login();

    this.client.on('loggedIn', this.loggedIn.bind(this));
    this.client.on('message', this.messageReceived.bind(this));

    this.log = new MessageLog();
  }

  loggedIn() {
  }

  messageReceived(message) {
    var channelType = message.getChannelType();
    if (channelType === 'Channel') {
      this.handleChannelMessage(message);
    } else if (channelType == 'DM') {
      this.handleDirectMessage(message);
    }
  }

  handleChannelMessage(message) {
    this.log.logMessage(message);
  }

  handleDirectMessage(message) {
    var channel = this.client.getChannelGroupOrDMByID(message.channel);

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
    var channel = this.client.getChannelByName(channelName);
    var statistics = this.log.getChannelStatistics(channel.id);

    for (var userID of Object.keys(statistics)) {
      var user = this.client.getUserByID(userID);
      channel.send(`${user.name} message count in #${channel.name}: ${statistics[userID]}`);
    }
  }
}

module.exports = StatsBot
