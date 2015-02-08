// FIXME extract a generalised solution from this and GenderMessageCount

class RaceMessageCount {
  constructor(statistics, userIsPersonOfColour) {
    this.statistics = statistics;
    this.userIsPersonOfColour = userIsPersonOfColour;
  }

  generate() {
    var userIDs = Object.keys(this.statistics);

    var counts = userIDs.reduce(function(counts, userID) {
      var isPersonOfColour = this.userIsPersonOfColour[userID];
      var count = this.statistics[userID];

      if (isPersonOfColour) {
        counts.peopleOfColour += count;
      } else if (isPersonOfColour === false) {
        counts.whitePeople += count;
      } else {
        counts.unknown += count;
      }

      return counts;
    }.bind(this), {peopleOfColour: 0, whitePeople: 0, unknown: 0});

    return counts;
  }
}

module.exports = RaceMessageCount;
