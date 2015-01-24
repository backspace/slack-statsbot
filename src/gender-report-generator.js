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
        } else {
          counts.notMen += count;
        }

        return counts;
      }, {men: 0, notMen: 0});

      var total = counts.men + counts.notMen;

      var report = [
        `Messages by men: ${(100*counts.men/total).toFixed(0)}%`,
        `Messages by not-men: ${(100*counts.notMen/total).toFixed(0)}%`
      ];

      return report;
    });
  }
}

module.exports = GenderReportGenerator;
