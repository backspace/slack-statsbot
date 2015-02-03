// TODO this should probably be further decomposed
// Also should maybe just return a reply which the bot actually sends?

class DirectMessageHandler {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  handle(channel, message) {
    var text = message.text.toLowerCase();

    if (text === 'info') {
      this.handleInformationRequest(channel, message);
    } else if (text === 'help') {
      this.handleHelpRequest(channel, message);
    } else {
      this.handleInformationUpdate(channel, message);
    }
  }

  handleInformationRequest(channel, message) {
    this.userRepository.retrieveAttribute(message.user, 'isMan').then(function(isMan) {
      var reply;

      if (isMan) {
        reply = 'We have you down here as being a man.';
      } else if (isMan === false) {
        reply = 'We have you down here as not being a man.';
      } else {
        reply = 'We don’t have you on record! Please say “true” if you are a man and “false” if you are not.';
      }

      channel.send(reply);
    });
  }

  handleInformationUpdate(channel, message) {
    var isMan = message.text === 'true';

    var reply;

    this.userRepository.storeAttribute(message.user, 'isMan', isMan);

    if (isMan) {
      reply = 'Okay, we have noted that you are a man. Say “false” if that is not the case.';
    } else {
      reply = 'Okay, we have noted that you are not a man. Say “true” if you are a man.';
    }

    channel.send(reply);
  }

  handleHelpRequest(channel, message) {
    channel.send('Hey, I’m a bot that collects statistics on who is taking up space in the channels I’m in. For now, I only track whether a participant is a man or not. To come: actual help');
  }
}

module.exports = DirectMessageHandler;
