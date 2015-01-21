var SlackClient = require('slack-client');

class StatsBot {
  constructor(client) {
    this.client = client || new SlackClient(process.env.SLACK_TOKEN);
    this.client.login();

    this.client.on('loggedIn', this.loggedIn.bind(this));
    this.client.on('message', this.messageReceived.bind(this));

    this.channelUserMessageCount = {};
  }

  loggedIn() {
    this.client.joinChannel('bot');
    this.channel = this.client.getChannelByName('bot');
  }

  messageReceived(message) {
    if (!this.channelUserMessageCount[message.channel]) {
      this.channelUserMessageCount[message.channel] = {};
    }

    var userMessageCount = this.channelUserMessageCount[message.channel];

    if (!userMessageCount[message.user]) {
      userMessageCount[message.user] = 0;
    }

    userMessageCount[message.user]++;

    var user = this.client.getUserByID(message.user);
    var channel = this.client.getChannelByID(message.channel);

    this.channel.send(`${user.name} message count in #${channel.name}: ${userMessageCount[message.user]}`);
  }
}

module.exports = StatsBot
