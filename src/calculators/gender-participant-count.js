var trinaryCounter = require('./trinary-counter');

class GenderParticipantCountReportGenerator {
  constructor(userMessages, userIsMan) {
    this.userMessages = userMessages;
    this.userIsMan = userIsMan;
  }

  generate() {
    return trinaryCounter(
      this.userMessages,
      this.userIsMan,
      {
        'true': 'men',
        'false': 'notMen',
        'else': 'unknown'
      }
    );
  }
}

module.exports = GenderParticipantCountReportGenerator;
