class GenderMessageCountStatisticsGenerator{
  constructor(statistics, userIsMan) {
    this.statistics = statistics;
    this.userIsMan = userIsMan;
  }

  generate() {
    var userIDs = Object.keys(this.statistics);

    var counts = userIDs.reduce(function(counts, userID) {
      var isMan = this.userIsMan[userID];
      var count = this.statistics[userID];

      if (isMan) {
        counts.men += count;
      } else if (isMan === false) {
        counts.notMen += count;
      } else {
        counts.unknown += count;
      }

      return counts;
    }.bind(this), {men: 0, notMen: 0, unknown: 0});

    return counts;
  }
}

module.exports = GenderMessageCountStatisticsGenerator;
