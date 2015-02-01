class GenderReportGenerator{
  constructor(statistics, userRepository) {
    this.statistics = statistics;
    this.userRepository = userRepository;
  }

  generate() {
    var userIDs = Object.keys(this.statistics);
    var repository = this.userRepository;
    var isManPromises = userIDs.map(function(userID) {
      return repository.retrieveAttribute(userID, 'isMan');
    });

    var statistics = this.statistics;

    // TODO would be nice to have RSVP.hash here
    return Promise.all(isManPromises).then(function(isManValues) {
      var counts = userIDs.reduce(function(counts, userID, userIndex) {
        var isMan = isManValues[userIndex];
        var count = statistics[userID];

        if (isMan) {
          counts.men += count;
        } else if (isMan === false) {
          counts.notMen += count;
        } else {
          counts.unknown += count;
        }

        return counts;
      }, {men: 0, notMen: 0, unknown: 0});

      var total = counts.men + counts.notMen + counts.unknown;

      var menPercent = (100*counts.men/total).toFixed(0);
      var notMenPercent = (100*counts.notMen/total).toFixed(0);

      var report;

      // TODO DRY up somehow
      if (counts.unknown > 0) {
        report = `men sent ${menPercent}%, not-men sent ${notMenPercent}%, and not sure of the rest`;
      } else {
        report = `men sent ${menPercent}% and not-men sent ${notMenPercent}%`;
      }

      return report;
    });
  }
}

module.exports = GenderReportGenerator;
