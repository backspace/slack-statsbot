class SlackAdapter {
  constructor(client) {
    this.client = client;

    this.client.on('message', this.messageReceived.bind(this));

    this.client.login();
  }

  registerListener(listener) {
    // TODO *could* maintain a list, but why?
    this.listener = listener;
  }

  messageReceived(message) {
    var channelType = message.getChannelType();
    var channel = this.client.getChannelGroupOrDMByID(message.channel);

    if (channelType === 'Channel') {
      this.listener.handleChannelMessage(channel, message);
    } else if (channelType == 'DM') {
      this.listener.handleDirectMessage(channel, message);
    }
  }

  getUser(id) {
    return this.client.getUserByID(id);
  }

  getChannelByName(name) {
    return this.client.getChannelByName(name);
  }

  getChannel(id) {
    return this.client.getChannelGroupOrDMByID(id);
  }
}

module.exports = SlackAdapter;
