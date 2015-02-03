// TODO there’s a profusion of single-method classes
// perhaps I’m overapplying Rubyisms

class GenderUpdateParser {
  constructor(message) {
    this.message = message;
  }

  parseIsMan() {
    return this.message == 'true';
  }
}

module.exports = GenderUpdateParser;
