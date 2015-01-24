var StatsBot = require('./src/statsbot');
var SlackAdapter = require('./src/slack-adapter');

var UserRepository = require('./src/user-repository');

var Sequelize = require('sequelize')
  , sequelize = new Sequelize(process.env.DATABASE_URL);

var SlackClient = require('slack-client');

var client = new SlackClient(process.env.SLACK_TOKEN);
var adapter = new SlackAdapter(client);

var userRepository = new UserRepository(sequelize);

var bot = new StatsBot(adapter, userRepository);

setInterval(function() {
  bot.reportAllChannelStatistics();
}, 60*60*1000);

module.exports = bot;
