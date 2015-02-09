class RaceUpdateParser {
  constructor(message) {
    this.message = message.toLowerCase();
  }

  parseIsPersonOfColour() {
    if (this.matchesPersonOfColourPatterns()) {
      return true;
    } else if (this.matchesNotPersonOfColourPatterns()) {
      return false;
    } else {
      return undefined;
    }
  }

  matchesPersonOfColourPatterns() {
    if ((this.message.match(/person of colou?r/) && !this.message.match(/not/)) ||
        (this.message.match(/white/) && this.message.match(/not/))) {
      return true;
    } else {
      return false;
    }
  }

  matchesNotPersonOfColourPatterns() {
    if ((this.message.match(/person of colou?r/) && this.message.match(/not/)) ||
        (this.message.match(/white/) && !this.message.match(/not/))) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = RaceUpdateParser;
