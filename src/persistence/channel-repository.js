class ChannelRepository {
  constructor(Channel) {
    this.Channel = Channel;
  }

  retrieveIgnoredAttributes(slackID) {
    return this.Channel.find({where: {slackID}}).then(channel => {
      if (channel) {
        return channel.ignoredAttributes;
      } else {
        return [];
      }
    });
  }
}

module.exports = ChannelRepository;
