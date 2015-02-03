var convict = require('convict');

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
    doc: 'The number of milliseconds between statistics reports.',
    env: 'REPORTING_INTERVAL',
    format: 'nat',
    default: 60*60*1000
  },
  statsChannel: {
    doc: 'The channel where the bot reports verbose statistics.',
    env: 'STATS_CHANNEL',
    format: String,
    default: 'statsbot'
  }
});

conf.validate();

module.exports = conf;
