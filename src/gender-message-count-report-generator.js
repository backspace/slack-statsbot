class GenderMessageCountReportGenerator{
  constructor(statistics) {
    this.statistics = statistics;
  }

  generate() {
    var counts = this.statistics;

    var total = counts.men + counts.notMen + counts.unknown;

    var menPercent = (100*counts.men/total).toFixed(0);
    var notMenPercent = (100*counts.notMen/total).toFixed(0);

    var report;

    // TODO DRY up somehow
    if (counts.unknown > 0) {
      var unknownPercent = (100*counts.unknown/total).toFixed(0);
      report = `men sent ${menPercent}%, not-men sent ${notMenPercent}%, and not sure of the other ${unknownPercent}%`;
    } else {
      report = `men sent ${menPercent}% and not-men sent ${notMenPercent}%`;
    }

    return report;
  }
}

module.exports = GenderMessageCountReportGenerator;
