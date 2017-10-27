// TODO this should probably be further decomposed
// Also should maybe just return a reply which the bot actually sends?

var every = require('lodash.every');
var find = require('lodash.find');

var UpdateParser = require('./update-parser');

var attributeConfigurations = require('./attribute-configurations');

class DirectMessageHandler {
  constructor({userRepository, channelRepository, adapter}) {
    this.userRepository = userRepository;
    this.channelRepository = channelRepository;

    this.adapter = adapter;

    this.attributeConfigurations = attributeConfigurations;
  }

  handle(channel, message) {
    if (!message.text || message.subtype === 'bot_message') return;
    var text = message.text.toLowerCase();

    var user = this.adapter.getUser(message.user);

    if (text === 'info') {
      this.handleInformationRequest(channel, message);
    } else if (text === 'help') {
      this.handleHelpRequest(channel, message);
    } else if (text.includes('unignore') && user.is_admin) {
      this.handleUnignoreAttributeRequest(channel, message);
    } else if (text.includes('ignore') && user.is_admin) {
      this.handleIgnoreAttributeRequest(channel, message);
    } else if (text.includes('options') && user.is_admin) {
      this.handleOptionsRequest(channel, message);
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

  handleIgnoreAttributeRequest(dmChannel, message) {
    const updateResults = this.parseAndUpdateChannelIgnores(dmChannel, message, this.channelRepository.addIgnoredAttribute)

    if (updateResults.ignoredAttribute) {
      dmChannel.send(`Okay, I will no longer report on ${updateResults.ignoredAttribute} in <#${updateResults.targetChannel.id}>.`);
    } else if (updateResults.channelNotFound) {
      dmChannel.send('Sorry, I couldn’t find that channel.');
    } else if (updateResults.attributeNotFound) {
      dmChannel.send('Sorry, that attribute is unknown.');
    }
  }

  handleUnignoreAttributeRequest(dmChannel, message) {
    const updateResults = this.parseAndUpdateChannelIgnores(dmChannel, message, this.channelRepository.removeIgnoredAttribute);

    if (updateResults.ignoredAttribute) {
      dmChannel.send(`I will again report on ${updateResults.ignoredAttribute} in <#${updateResults.targetChannel.id}>.`);
    } else if (updateResults.channelNotFound) {
      dmChannel.send('Sorry, I couldn’t find that channel.');
    } else if (updateResults.attributeNotFound) {
      dmChannel.send('Sorry, that attribute is unknown.');
    }
  }

  handleOptionsRequest(dmChannel, message) {
    var messageText = message.text;
    var targetChannel = this.parseChannelFromMessageText(messageText);

    this.channelRepository.retrieveIgnoredAttributes(targetChannel.id).then(ignoredAttributes => {
      if (ignoredAttributes.length) {
        dmChannel.send(`<#${targetChannel.id}> reports ignore: ${ignoredAttributes.join(', ')}`);
      } else {
        dmChannel.send(`<#${targetChannel.id}> has no ignored attributes.`);
      }
    });
  }

  parseChannelFromMessageText(text) {
    var targetChannelID = text.match(/\<#(\w*)>/)[1];
    var targetChannel = this.adapter.getChannel(targetChannelID);

    return targetChannel;
  }

  parseAndUpdateChannelIgnores(dmChannel, message, repositoryFunction) {
    var messageText = message.text;
    var targetChannel = this.parseChannelFromMessageText(message.text);

    if (targetChannel) {
      var ignoredAttribute = this.attributeConfigurations.map(configuration => configuration.name).find(attribute => messageText.includes(attribute));

      if (ignoredAttribute) {
        repositoryFunction.call(this.channelRepository, targetChannel.id, ignoredAttribute);
        return {ignoredAttribute, targetChannel};
      } else {
        return {attributeNotFound: true};
      }

    } else {
      return {channelNotFound: true};
    }
  }
}

// TODO maybe messages should be collected somewhere central, and parameterised

DirectMessageHandler.HELP_MESSAGE = 'You can let me know “I’m not a man”, “I am a person of colour”, “it’s complicated whether I am white” and other such variations, or ask for my current information on you with “info”.  To erase what you’ve previously told me, say "It is unknown whether I am a {man,woman}" or "It is unknown whether I am {a person of colou?r, white}".  View my source at https://github.com/backspace/slack-statsbot';
DirectMessageHandler.VERBOSE_HELP_MESSAGE = `Hey, I’m a bot that collects statistics on who is taking up space in the channels I’m in. For now, I only track whether or not a participant is a man and/or a person of colour. ${DirectMessageHandler.HELP_MESSAGE}. Please note that, while I won’t directly reveal the answers you provide, it is sometimes possible to deduce them from the statistics I provide and channel logs.`;

module.exports = DirectMessageHandler;
