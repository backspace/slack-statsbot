class GenderParticipantCountReportGenerator {
  constructor(userMessages, userIsMan) {
    this.userMessages = userMessages;
    this.userIsMan = userIsMan;
  }

  generate() {
    var userIDs = Object.keys(this.userMessages);

    var counts = userIDs.reduce(function(counts, userID) {
      var isMan = this.userIsMan[userID];

      if (isMan) {
        counts.men += 1;
      } else if (isMan === false) {
        counts.notMen += 1;
      } else {
        counts.unknown += 1;
      }

      return counts;
    }.bind(this), {men: 0, notMen: 0, unknown: 0});

    return counts;
  }
}

module.exports = GenderParticipantCountReportGenerator;
