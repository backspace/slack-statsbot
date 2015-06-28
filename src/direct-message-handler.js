// TODO this should probably be further decomposed
// Also should maybe just return a reply which the bot actually sends?

var every = require('lodash.every');
var find = require('lodash.find');

var UpdateParser = require('./update-parser');

class DirectMessageHandler {
  constructor(userRepository) {
    this.userRepository = userRepository;

    this.attributeConfigurations = [
      DirectMessageHandler.MANNESS_CONFIGURATION,
      DirectMessageHandler.POCNESS_CONFIGURATION
    ];
  }

  handle(channel, message) {
    if (!message.text) return;
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
    Promise.all(this.attributeConfigurations.map(function(configuration) {
      return this.userRepository.retrieveAttribute(message.user, configuration.name);
    }.bind(this))).then(function(values) {
      var reply;

      if (every(values, function(value) {return value == null || value == undefined})) {
        reply = `We don’t have you on record! ${DirectMessageHandler.HELP_MESSAGE}`;
      } else {
        reply = 'Our records indicate that:\n\n';

        this.attributeConfigurations.forEach(function(attributeConfiguration, index) {
          var value = values[index];

          var valueConfiguration = find(attributeConfiguration.values, function(valueConfiguration) {
            return valueConfiguration.value == value;
          });

          if (valueConfiguration) {
            reply += `* ${valueConfiguration.texts.information}\n`;
          } else {
            reply += `* ${attributeConfiguration.unknownValue.texts.information}\n`;
          }
        });
      }

      channel.send(reply);
    }.bind(this));
  }

  handleInformationUpdate(channel, message) {
    var handled = false;

    this.attributeConfigurations.forEach(function(configuration) {
      var parser = new UpdateParser(configuration, message.text);
      var result = parser.parse();

      if (result !== undefined) {
        handled = true;
        this.handleAttributeUpdate(
          channel,
          message.user,
          result,
          configuration
        );
      }
    }.bind(this));

    if (!handled) {
      channel.send(`I’m sorry, I’m not that advanced and I didn’t understand your message. ${DirectMessageHandler.HELP_MESSAGE}`);
    }
  }

  handleAttributeUpdate(channel, userID, value, attributeConfiguration) {
    var reply;
    this.userRepository.storeAttribute(userID, attributeConfiguration.name, value);

    var matchingValue = find(attributeConfiguration.values, function(configurationValue) {
      return configurationValue.value === value;
    });

    if (matchingValue) {
      reply = matchingValue.texts.update;
    }

    channel.send(reply);
  }

  handleHelpRequest(channel, message) {
    channel.send(DirectMessageHandler.VERBOSE_HELP_MESSAGE);
  }
}

// TODO maybe messages should be collected somewhere central, and parameterised

DirectMessageHandler.HELP_MESSAGE = 'You can let me know “I’m not a man”, “I am a person of colour”, “it’s complicated whether I am white” and other such variations, or ask for my current information on you with “info”. View my source at https://github.com/backspace/slack-statsbot';
DirectMessageHandler.VERBOSE_HELP_MESSAGE = `Hey, I’m a bot that collects statistics on who is taking up space in the channels I’m in. For now, I only track whether or not a participant is a man and/or a person of colour. ${DirectMessageHandler.HELP_MESSAGE}`;

DirectMessageHandler.MANNESS_CONFIGURATION = require('../config/manness');
DirectMessageHandler.POCNESS_CONFIGURATION = require('../config/pocness');

module.exports = DirectMessageHandler;
