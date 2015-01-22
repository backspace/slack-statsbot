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
    this.client.joinChannel('bot');
    this.channel = this.client.getChannelByName('bot');
  }

  messageReceived(message) {
    this.log.logMessage(message);

    var user = this.client.getUserByID(message.user);
    var channel = this.client.getChannelByID(message.channel);

    this.channel.send(`${user.name} message count in #${channel.name}: ${this.log.getMessageCount(message.channel, message.user)}`);
  }
}

module.exports = StatsBot
