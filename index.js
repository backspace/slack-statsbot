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

var bot = new StatsBot(adapter, userRepository, conf.get('statsChannel'));


// TODO this should probably be its own file
var cronParser = require('cron-parser');
var reportingInterval = conf.get('reportingInterval');

var interval = cronParser.parseExpression(reportingInterval);

function setNextTimeout() {
  var next = interval.next();
  var timeFromNow = next - new Date();

  setTimeout(function() {
    bot.reportAllChannelStatistics();
    setNextTimeout();
  }, timeFromNow);
}

setNextTimeout();

module.exports = bot;
