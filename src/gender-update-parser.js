// TODO there’s a profusion of single-method classes
// perhaps I’m overapplying Rubyisms

class GenderUpdateParser {
  constructor(message) {
    this.message = message;
  }

  parseIsMan() {
    if (this.message === 'true') {
      return true;
    } else if (this.message === 'false') {
      return false;
    } else {
      return undefined;
    }
  }
}

module.exports = GenderUpdateParser;
