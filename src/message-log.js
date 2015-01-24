class MessageLog {
  constructor() {
    this.channels = {};
  }

  logMessage(message) {
    if (!this.channels[message.channel]) {
      this.channels[message.channel] = {
        statistics: {},
        metadata: {
          startTime: new Date()
        }
      };
    }

    var userMessageCount = this.channels[message.channel].statistics;

    if (!userMessageCount[message.user]) {
      userMessageCount[message.user] = 0;
    }

    userMessageCount[message.user]++;
  }

  getChannelStatistics(channel) {
    return this.channels[channel];
  }

  getChannels() {
    return Object.keys(this.channels);
  }
}

module.exports = MessageLog;
