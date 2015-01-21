var SlackClient = require('slack-client');

class StatsBot {
  constructor() {
    this.client = new SlackClient(process.env.SLACK_TOKEN);
  }
}

module.exports = StatsBot
