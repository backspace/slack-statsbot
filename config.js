var convict = require('convict');
var cronParser = require('cron-parser');

var appManifest = require('./app');
var appEnv = appManifest.env;

// Could probably be more clever here by transforming the Heroku-specific
// configuration to node-convict-compatible, but seems okay for now

var isURL = require('validator').isURL;

var conf = convict({
  databaseURL: {
    doc: 'The URL for the Postgres database, including username and password.',
    env: 'DATABASE_URL',
    format(val) {
      isURL(val, {require_protocol: true, protocols: ['postgres']}, 'should be a Postgres URL');
    },
    default: ''
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
  reportingThreshold: {
    doc: appEnv.REPORTING_THRESHOLD.description,
    env: 'REPORTING_THRESHOLD',
    format: 'nat',
    default: 10
  },
  statsChannel: {
    doc: appEnv.STATS_CHANNEL.description,
    env: 'STATS_CHANNEL',
    format: String,
    default: appEnv.STATS_CHANNEL.value
  },
  topUnknownsToQuery: {
    doc: appEnv.TOP_UNKNOWNS_TO_QUERY.description,
    env: 'TOP_UNKNOWNS_TO_QUERY',
    format: 'nat',
    default: appEnv.TOP_UNKNOWNS_TO_QUERY.value
  }
});

conf.validate();

module.exports = conf;
