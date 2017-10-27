var conf = require('./config');

var SlackAdapter = require('./src/slack-adapter');

var SlackClient = require('slack-client');

var client = new SlackClient(conf.get('slackToken'));
var adapter = new SlackAdapter(client);

module.exports = adapter;
