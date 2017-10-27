// FIXME this seems like a bad name/position? Separate into fetching and generating?

const every = require('lodash.every');
const find = require('lodash.find');

module.exports = function userInformation(userID, {userRepository, attributeConfigurations, helpMessage}) {
  // FIXME fetch the entire user rather than run multiple queries
  return Promise.all(attributeConfigurations.map(function(configuration) {
    return userRepository.retrieveAttribute(userID, configuration.name);
  })).then(function(values) {
    var reply;

    if (every(values, function(value) {return value == null || value == undefined})) {
      reply = `We don’t have you on record! ${helpMessage}`;
    } else {
      reply = 'Our records indicate that:\n\n';

      attributeConfigurations.forEach(function(attributeConfiguration, index) {
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

    return reply;
  });
}
