// TODO this should probably be further decomposed
// Also should maybe just return a reply which the bot actually sends?

var GenderUpdateParser = require('./gender-update-parser');

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
    var parser = new GenderUpdateParser(message.text);
    var isMan = parser.parseIsMan();

    var reply;

    if (isMan !== undefined) {
      this.userRepository.storeAttribute(message.user, 'isMan', isMan);
    }

    if (isMan === true) {
      reply = 'Okay, we have noted that you are a man. If I got it wrong, try saying “I am *not* a man!”';
    } else if (isMan === false) {
      reply = 'Okay, we have noted that you are not a man. If I got it wrong, try saying “I am a man”.';
    } else {
      reply = `I’m sorry, I’m not that advanced and I didn’t understand your message. ${DirectMessageHandler.HELP_MESSAGE}`;
    }

    channel.send(reply);
  }

  handleHelpRequest(channel, message) {
    channel.send(DirectMessageHandler.VERBOSE_HELP_MESSAGE);
  }
}

// TODO maybe messages should be collected somewhere central, and parameterised

DirectMessageHandler.HELP_MESSAGE = 'You can let me know “I’m not a man” or “I am a man”, or ask for my current information on you with “info”.';
DirectMessageHandler.VERBOSE_HELP_MESSAGE = `Hey, I’m a bot that collects statistics on who is taking up space in the channels I’m in. For now, I only track whether a participant is a man or not. ${DirectMessageHandler.HELP_MESSAGE}`;

module.exports = DirectMessageHandler;
