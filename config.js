var convict = require('convict');
var cronParser = require('cron-parser');

var conf = convict({
  databaseURL: {
    doc: 'The URL for the Postgres database, including username and password.',
    env: 'DATABASE_URL',
    // TODO would be nice to have URL validation but postgres:// rejected
    format: String,
    default: null
  },
  slackToken: {
    doc: 'The API token in the Slack bot integration settings.',
    env: 'SLACK_TOKEN',
    format: String,
    default: null
  },
  reportingInterval: {
    doc: 'A crontab-style specification of how often the bot should report statistics.',
    env: 'REPORTING_INTERVAL',
    format(val) {
      try {
        cronParser.parseExpression(val);
      } catch (err) {
        throw new Error('REPORTING_INTERVAL should be in crontab format, see https://github.com/harrisiirak/cron-parser');
      }
    },
    default: '0 * * * *'
  },
  // TODO This is semi-duplicated in app.json
  // Any way to connect them?
  statsChannel: {
    doc: 'The channel where the bot reports verbose statistics.',
    env: 'STATS_CHANNEL',
    format: String,
    default: 'statsbot'
  }
});

conf.validate();

module.exports = conf;
