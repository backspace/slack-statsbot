var conf = require('./config');

var StatsBot = require('./src/statsbot');
var SlackAdapter = require('./src/slack-adapter');

var UserRepository = require('./src/persistence/user-repository');

var Sequelize = require('sequelize')
  , sequelize = new Sequelize(conf.get('databaseURL'));

var SlackClient = require('slack-client');

var client = new SlackClient(conf.get('slackToken'));
var adapter = new SlackAdapter(client);

var userRepository = new UserRepository(sequelize);

var bot = new StatsBot(adapter, userRepository, {
  statsChannel: conf.get('statsChannel'),
  topUnknownsToQuery: conf.get('topUnknownsToQuery')
});


var reportingInterval = conf.get('reportingInterval');

var scheduler = require('./src/scheduler');

scheduler(reportingInterval, function() {
  bot.reportAllChannelStatistics();
});

module.exports = bot;
