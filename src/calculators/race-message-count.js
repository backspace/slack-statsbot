var trinaryGrouper = require('./trinary-grouper');

class RaceMessageCount {
  constructor(statistics, userIsPersonOfColour) {
    this.statistics = statistics;
    this.userIsPersonOfColour = userIsPersonOfColour;
  }

  generate() {
    return trinaryGrouper(
      this.statistics,
      this.userIsPersonOfColour,
      {
        'true': 'peopleOfColour',
        'false': 'whitePeople',
        'else': 'unknown'
      }
    );
  }
}

module.exports = RaceMessageCount;
