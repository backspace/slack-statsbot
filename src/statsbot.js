var SlackClient = require('slack-client');
var MessageLog = require('./message-log');

var RepositoryAttributeExtractor = require('./persistence/repository-attribute-extractor');

var VerboseReportGenerator = require('./reports/verbose-attribute');

var MANNESS_CONFIGURATION = require('../config/manness');
var POCNESS_CONFIGURATION = require('../config/pocness');

var TerseReportGenerator = require('./reports/terse');

var DirectMessageHandler = require('./direct-message-handler');

var requestUnknownSelfIdentification = require('./request-unknown-self-identification');

var values = require('lodash.values');
var moment = require('moment');

class StatsBot {
  constructor(adapter, userRepository, options) {
    this.adapter = adapter;
    this.adapter.registerListener(this);

    this.log = new MessageLog();
    this.userRepository = userRepository;

    options = options || {};
    this.statsChannel = options.statsChannel;
    this.topUnknownsToQuery = options.topUnknownsToQuery;
    this.reportingThreshold = options.reportingThreshold;

    this.directMessageHandler = new DirectMessageHandler(this.userRepository);
  }

  handleConnectedEvent() {
    this.getStatsChannel().send('I just started up!');
  }

  handleErrorEvent(error) {
    console.log('error:', error);
    this.getStatsChannel().send(`Error! \`${JSON.stringify(error)}\``);
  }

  getStatsChannel() {
    let botChannel = this.adapter.getChannelByName(this.statsChannel);

    if (botChannel) {
      return botChannel;
    } else {
      let nullChannel = {
        send() {}
      };

      return nullChannel;
    }
  }

  handleChannelMessage(channel, message) {
    if (this.mustNotLog(message)) { return; }
    this.log.logMessage(message);
  }

  mustNotLog(message) {
    if (this.adapter.getChannel(message.channel).name == this.statsChannel) {
      return true;
    }

    // Message subtypes are listed here:
    // https://api.slack.com/events/message
    var subtypesToLog = [
      'me_message',
      'file_share',
      'file_comment',
      'file_mention'
    ];

    if (message.subtype) {
      return subtypesToLog.indexOf(message.subtype) == -1;
    } else {
      return false;
    }
  }

  handleDirectMessage(channel, message) {
    this.directMessageHandler.handle(channel, message);
  }

  reportChannelStatistics(channelID) {
    var channel = this.adapter.getChannel(channelID);
    var botChannel = this.adapter.getChannelByName(this.statsChannel);
    var statisticsPackage = this.log.getChannelStatistics(channel.id);

    if (!statisticsPackage) {
      return;
    }

    var statistics = statisticsPackage.statistics;
    var metadata = statisticsPackage.metadata;

    var counts = values(statistics);
    var total = counts.reduce(function(total, count) {
      return total + count;
    }, 0);

    if (total < this.reportingThreshold) {
      return;
    } else {
      this.log.resetChannelStatistics(channel.id);
    }

    var configurations = [
      MANNESS_CONFIGURATION,
      POCNESS_CONFIGURATION
    ];

    var extractionPromises = configurations.map(function(configuration) {
      return new RepositoryAttributeExtractor(this.userRepository, configuration.name, Object.keys(statistics)).extract();
    }.bind(this));

    Promise.all(extractionPromises).then(function(values) {
      var configurationAndValues = configurations.map(function(configuration, index) {
          requestUnknownSelfIdentification({
            statistics: statistics,
            userRepository: this.userRepository,
            knownness: values[index],
            adapter: this.adapter,
            count: this.topUnknownsToQuery
          });

        return {
          configuration: configuration,
          values: values[index]
        };
      }.bind(this));


      var verboseReport = `<#${channel.name}> since ${moment(metadata.startTime).fromNow()}:\n`;

      configurationAndValues.forEach(function(configurationAndValues) {
        var report = new VerboseReportGenerator(statistics, configurationAndValues.values, configurationAndValues.configuration).generate();

        verboseReport += `${report}\n`;
      });

      botChannel.send(verboseReport);

      var terseReport = new TerseReportGenerator(statistics, configurationAndValues, metadata.startTime, botChannel.name).generate();
      channel.send(terseReport);

    }.bind(this));
  }

  reportAllChannelStatistics() {
    for (let channelID of this.log.getChannels()) {
      this.reportChannelStatistics(channelID);
    }
  }
}

module.exports = StatsBot
