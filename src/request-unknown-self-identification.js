// Trying out a function instead of a class,
// options object instead of a parameter list

var selectUnknowns = require('./select-unknowns');
var selectTopKeys = require('./select-top-keys');

var RepositoryAttributeExtractor = require('./persistence/repository-attribute-extractor');

// FIXME this seems weird
var VERBOSE_HELP_MESSAGE = require('./direct-message-handler').VERBOSE_HELP_MESSAGE;

module.exports = function(options) {
  var statistics = options.statistics;
  var userRepository = options.userRepository;
  var userIsMan = options.userIsMan;
  var adapter = options.adapter;

  var statisticsForUnknowns = selectUnknowns(statistics, userIsMan);

  var hasBeenQueriedExtractor = new RepositoryAttributeExtractor(userRepository, 'hasBeenQueried', Object.keys(statisticsForUnknowns));

  hasBeenQueriedExtractor.extract().then(function(userHasBeenQueried) {
    // TODO this excludes users who have hasBeenQueried=false, maybe okay?
    var statisticsForUnqueriedUnknowns = selectUnknowns(statisticsForUnknowns, userHasBeenQueried);
    var topTwoUnknowns = selectTopKeys(statisticsForUnqueriedUnknowns, 2);

    topTwoUnknowns.forEach(function(unknown) {
      var dm = adapter.getDMByUser(unknown);
      dm.send(`${VERBOSE_HELP_MESSAGE} If you don’t want to answer that’s okay, I won’t ask again.`);

      userRepository.storeAttribute(unknown, 'hasBeenQueried', true);
    });
  });
}
