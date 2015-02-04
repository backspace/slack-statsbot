var convict = require('convict');
var cronParser = require('cron-parser');

var appManifest = require('./app');
var appEnv = appManifest.env;

// Could probably be more clever here by transforming the Heroku-specific
// configuration to node-convict-compatible, but seems okay for now

var conf = convict({
  databaseURL: {
    doc: 'The URL for the Postgres database, including username and password.',
    env: 'DATABASE_URL',
    // TODO would be nice to have URL validation but postgres:// rejected
    format: String,
    default: null
  },
  slackToken: {
    doc: appEnv.SLACK_TOKEN.description,
    env: 'SLACK_TOKEN',
    format: String,
    default: null
  },
  reportingInterval: {
    doc: appEnv.REPORTING_INTERVAL.description,
    env: 'REPORTING_INTERVAL',
    format(val) {
      try {
        cronParser.parseExpression(val);
      } catch (err) {
        throw new Error('REPORTING_INTERVAL should be in crontab format, see https://github.com/harrisiirak/cron-parser');
      }
    },
    default: appEnv.REPORTING_INTERVAL.value
  },
  statsChannel: {
    doc: appEnv.STATS_CHANNEL.description,
    env: 'STATS_CHANNEL',
    format: String,
    default: appEnv.STATS_CHANNEL.value
  }
});

conf.validate();

module.exports = conf;
