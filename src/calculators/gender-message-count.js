var trinaryGrouper = require('./trinary-grouper');

class GenderMessageCountStatisticsGenerator{
  constructor(statistics, userIsMan) {
    this.statistics = statistics;
    this.userIsMan = userIsMan;
  }

  generate() {
    return trinaryGrouper(
      this.statistics,
      this.userIsMan,
      {
        'true': 'men',
        'false': 'notMen',
        'else': 'unknown'
      }
    );
  }
}

module.exports = GenderMessageCountStatisticsGenerator;
