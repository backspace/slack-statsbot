var includes = require('amp-includes');

// TODO there’s a profusion of single-method classes
// perhaps I’m overapplying Rubyisms

class GenderUpdateParser {
  constructor(message) {
    this.message = message.toLowerCase();
  }

  parseIsMan() {
    if (this.matchesManPatterns()) {
      return true;
    } else if (this.matchesNotManPatterns()) {
      return false;
    } else {
      return undefined;
    }
  }

  matchesManPatterns() {
    if (this.message === 'true') {
      return true;
    } else if (
        includes(this.message, 'man') &&
        !includes(this.message, 'not')) {
      return true;
    } else {
      return false;
    }
  }

  matchesNotManPatterns() {
    if (this.message === 'false') {
      return true;
    } else if (
        includes(this.message, 'man') &&
        includes(this.message, 'not')) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = GenderUpdateParser;
