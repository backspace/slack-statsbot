class MessageLog {
  constructor() {
    this.channels = {};
  }

  logMessage(message) {
    if (!this.channels[message.channel]) {
      this.channels[message.channel] = this.buildNewStatisticsPackage();
    }

    var userMessageCount = this.channels[message.channel].statistics;

    if (!userMessageCount[message.user]) {
      userMessageCount[message.user] = 0;
    }

    userMessageCount[message.user]++;
  }

  getChannelStatistics(channel) {
    var statisticsPackage = this.channels[channel];

    this.channels[channel] = this.buildNewStatisticsPackage();

    return statisticsPackage;
  }

  getChannels() {
    return Object.keys(this.channels);
  }

  buildNewStatisticsPackage() {
    return {
      statistics: {},
      metadata: {
        startTime: new Date()
      }
    };
  }
}

module.exports = MessageLog;
