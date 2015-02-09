// TODO this should probably be further decomposed
// Also should maybe just return a reply which the bot actually sends?

var GenderUpdateParser = require('./gender-update-parser');
var RaceUpdateParser = require('./race-update-parser');

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
    // FIXME fetch the entire user rather than run multiple queries
    Promise.all([
        this.userRepository.retrieveAttribute(message.user, 'isMan'),
        this.userRepository.retrieveAttribute(message.user, 'isPersonOfColour')
    ]).then(function(attributes) {
      // var [isMan, isPersonOfColour] = attributes;
      // TODO use destructuring assignment
      var isMan = attributes[0];
      var isPersonOfColour = attributes[1];

      var reply;

      if ((isMan === null || isMan === undefined) &&
          (isPersonOfColour === null || isPersonOfColour === undefined)) {
        reply = `We don’t have you on record! ${DirectMessageHandler.HELP_MESSAGE}`;
      } else {
        var genderReply;
        var raceReply;

        reply = 'Our records indicate that:\n\n';

        if (isMan === true) {
          genderReply = 'you are a man';
        } else if (isMan === false) {
          genderReply = 'you are not a man';
        } else {
          genderReply = 'we have no information on whether or not you are a man';
        }

        if (isPersonOfColour === true) {
          raceReply = 'you are a person of colour';
        } else if (isPersonOfColour === false) {
          raceReply = 'you are not a person of colour';
        } else {
          raceReply = 'we have no information on whether or not you are a person of colour';
        }

        reply += `* ${genderReply}\n* ${raceReply}`;
      }

      channel.send(reply);
    });
  }

  handleInformationUpdate(channel, message) {
    var genderParser = new GenderUpdateParser(message.text);
    var isMan = new GenderUpdateParser(message.text).parseIsMan();
    var isPersonOfColour = new RaceUpdateParser(message.text).parseIsPersonOfColour();

    if (isMan !== undefined) {
      this.handleGenderUpdate(channel, message.user, isMan);
    } else if (isPersonOfColour !== undefined) {
      this.handleRaceUpdate(channel, message.user, isPersonOfColour);
    } else {
      channel.send(`I’m sorry, I’m not that advanced and I didn’t understand your message. ${DirectMessageHandler.HELP_MESSAGE}`);
    }
  }

  handleGenderUpdate(channel, userID, isMan) {
    var reply;
    this.userRepository.storeAttribute(userID, 'isMan', isMan);

    if (isMan === true) {
      reply = 'Okay, we have noted that you are a man. If I got it wrong, try saying “I am *not* a man!”';
    } else if (isMan === false) {
      reply = 'Okay, we have noted that you are not a man. If I got it wrong, try saying “I am a man”.';
    }

    channel.send(reply);
  }

  handleRaceUpdate(channel, userID, isPersonOfColour) {
    var reply;
    this.userRepository.storeAttribute(userID, 'isPersonOfColour', isPersonOfColour);

    if (isPersonOfColour === true) {
      reply = 'We have noted that you are a person of colour. If I got it wrong, try saying “I am not a person of colour”';
    } else if (isPersonOfColour === false) {
      reply = 'We have noted that you are not a person of colour. If I got it wrong, try saying “I am a person of colour”';
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
