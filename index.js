var StatsBot = require('./src/statsbot');
var SlackAdapter = require('./src/slack-adapter');

var SlackClient = require('slack-client');

var client = new SlackClient(process.env.SLACK_TOKEN);
var adapter = new SlackAdapter(client);

var bot = new StatsBot(adapter);

module.exports = bot;
