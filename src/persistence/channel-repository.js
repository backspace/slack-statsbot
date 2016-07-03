class ChannelRepository {
  constructor(Channel) {
    this.Channel = Channel;
  }

  addIgnoredAttribute(slackID, attribute) {
    return this.Channel.findOrCreate({where: {slackID}}).spread(channel => {
      channel.ignoredAttributes = channel.ignoredAttributes.concat([attribute]);
      return channel.save();
    });
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
