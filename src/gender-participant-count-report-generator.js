// TODO quite similar to message count report

class GenderParticipantCountReportGenerator {
  constructor(participantCount) {
    this.participantCount = participantCount;
  }

  generate() {
    var counts = this.participantCount;

    var total = counts.men + counts.notMen + counts.unknown;

    var menPercent = (100*counts.men/total).toFixed(0);
    var notMenPercent = (100*counts.notMen/total).toFixed(0);

    var report;

    // TODO DRY up
    if (counts.unknown > 0) {
      var unknownPercent = (100*counts.unknown/total).toFixed(0);
      report = `${menPercent}% of participants were men, ${notMenPercent}% were not-men, and ${unknownPercent}% were unknown`;
    } else {
      report = `${menPercent}% of participants were men and ${notMenPercent}% were not-men`;
    }

    return report;
  }
}

module.exports = GenderParticipantCountReportGenerator;
