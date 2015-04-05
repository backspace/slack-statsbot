var every = require('lodash.every');
var some = require('lodash.some');

class UpdateParser {
  constructor(attributeConfiguration, message) {
    this.attributeConfiguration = attributeConfiguration;
    this.message = message.toLowerCase();
  }

  parse() {
    var result = undefined;

    var matcherMatchesMessage = this.matcherMatchesMessage.bind(this);

    this.attributeConfiguration.values.forEach(function(value) {
      var matchesValue = some(value.matcherSets, function(matcherSet) {
        return every(matcherSet, function(matcher) {
          return matcherMatchesMessage(matcher);
        });
      });

      if (matchesValue) {
        result = value.value;
      }
    });

    return result;
  }

  matcherMatchesMessage(matcher) {
    if (matcher.matches) {
      return this.message.match(new RegExp(matcher.matches));
    } else if (matcher.doesNotMatch) {
      return !this.message.match(new RegExp(matcher.doesNotMatch));
    } else {
      console.error('Unknown matcher: ', matcher);
      return false;
    }
  }
}

module.exports = UpdateParser;
