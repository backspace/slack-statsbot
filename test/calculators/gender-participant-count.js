#!/usr/bin/env iojs --es_staging --use-strict

var test = require('tape');

var GenderParticipantCountStatisticsGenerator = require('../../src/calculators/gender-participant-count');

test('GenderParticipantCountStatisticsGenerator counts participants by gender', function(t) {
  var userMessages = {
    'Man': 4,
    'Also-man': 1,
    'Not-man': 3,
    'Unknown': 2
  };

  var userIsMan = {
    'Man': true,
    'Also-man': true,
    'Not-man': false,
    'Unknown': undefined
  };

  var statistics = new GenderParticipantCountStatisticsGenerator(userMessages, userIsMan).generate();

  t.equal(statistics.men, 2, 'counts 2 men');
  t.equal(statistics.notMen, 1, 'counts 1 not-man');
  t.equal(statistics.unknown, 1, 'counts 1 unknown');

  t.end();
});

