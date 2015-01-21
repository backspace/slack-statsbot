var SlackClient = require('slack-client');

class StatsBot {
  constructor() {
    this.client = new SlackClient();
  }
}

module.exports = StatsBot
