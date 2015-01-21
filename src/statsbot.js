var SlackClient = require('slack-client');

class StatsBot {
  constructor(client) {
    this.client = client || new SlackClient(process.env.SLACK_TOKEN);
    this.client.login();

    this.client.on('loggedIn', this.loggedIn.bind(this));
    this.client.on('message', this.messageReceived.bind(this));

    this.userMessageCount = {};
  }

  loggedIn() {
    this.client.joinChannel('bot');
    this.channel = this.client.getChannelByName('bot');
  }

  messageReceived(message) {
    if (!this.userMessageCount[message.user]) {
      this.userMessageCount[message.user] = 0;
    }

    this.userMessageCount[message.user]++;

    var user = this.client.getUserByID(message.user);
    this.channel.send(`${user.name} message count: ${this.userMessageCount[message.user]}`);
  }
}

module.exports = StatsBot
