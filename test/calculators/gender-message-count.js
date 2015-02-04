#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var GenderMessageCountStatisticsGenerator = require('../../src/calculators/gender-message-count');

test('GenderMessageCountStatisticsGenerator groups messages by gender', function(t) {
  var statistics = {
    'Man': 4,
    'Also-man': 3,
    'Not-man': 2,
    'Unknown': 1
  };

  var userIsMan = {
    'Man': true,
    'Also-man': true,
    'Not-man': false,
    'Unknown': undefined
  };

  var generator = new GenderMessageCountStatisticsGenerator(statistics, userIsMan);
  statistics = generator.generate();

  t.equal(statistics.men, 7, 'counts 7 messages from men');
  t.equal(statistics.notMen, 2, 'counts 2 messages from not-men');
  t.equal(statistics.unknown, 1, 'counts 1 messages from unknown');

  t.end();
});
