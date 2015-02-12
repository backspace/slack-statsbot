var trinaryCounter = require('./trinary-counter');

class RaceParticipantCountReportGenerator {
  constructor(userMessages, userIsPersonOfColour) {
    this.userMessages = userMessages;
    this.userIsPersonOfColour = userIsPersonOfColour;
  }

  generate() {
    return trinaryCounter(
      this.userMessages,
      this.userIsPersonOfColour,
      {
        'true': 'peopleOfColour',
        'false': 'whitePeople',
        'else': 'unknown'
      }
    );
  }
}

module.exports = RaceParticipantCountReportGenerator;
