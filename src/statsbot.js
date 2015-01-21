var SlackClient = require('slack-client');

class StatsBot {
  constructor(client) {
    this.client = client || new SlackClient(process.env.SLACK_TOKEN);
    this.client.login();

    this.client.on('loggedIn', this.loggedIn.bind(this));
  }

  loggedIn() {
    this.client.joinChannel('bot');
  }
}

module.exports = StatsBot
