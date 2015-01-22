class MessageLog {
  constructor() {
    this.channelUserMessageCount = {};
  }

  logMessage(message) {
    if (!this.channelUserMessageCount[message.channel]) {
      this.channelUserMessageCount[message.channel] = {};
    }

    var userMessageCount = this.channelUserMessageCount[message.channel];

    if (!userMessageCount[message.user]) {
      userMessageCount[message.user] = 0;
    }

    userMessageCount[message.user]++;
  }

  getChannelStatistics(channel) {
    return this.channelUserMessageCount[channel];
  }
}

module.exports = MessageLog;
